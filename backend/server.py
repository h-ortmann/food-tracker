from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import anthropic
import datetime
import json
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

database_url = os.environ.get("DATABASE_URL", "sqlite:///food_tracker.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"poolclass": NullPool}
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    calories = db.Column(db.Integer)
    grams = db.Column(db.Float)
    meal_type = db.Column(db.String(50))
    date = db.Column(db.Date, default=datetime.date.today)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "calories": self.calories,
            "grams": self.grams,
            "meal_type": self.meal_type,
            "date": self.date.isoformat() if self.date else None,
            "created_at": self.created_at.strftime("%I:%M %p").lstrip("0") if self.created_at else None,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }


class Symptom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # bloating / pain / nausea / diarrhea / stool
    severity = db.Column(db.Integer)  # 1-5 scale, not used for stool
    body_part = db.Column(db.String(50))  # only for pain: stomach / digestive_tract / head / uterus
    bristol_scale = db.Column(db.Integer)  # only for stool: 1-7
    notes = db.Column(db.String(500))
    date = db.Column(db.Date, default=datetime.date.today)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "severity": self.severity,
            "body_part": self.body_part,
            "bristol_scale": self.bristol_scale,
            "notes": self.notes,
            "date": self.date.isoformat() if self.date else None,
            "created_at": self.created_at.strftime("%I:%M %p").lstrip("0") if self.created_at else None,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }


class WeightEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    weight = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.date.today)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "weight": self.weight,
            "date": self.date.isoformat() if self.date else None,
            "created_at": self.created_at.strftime("%I:%M %p").lstrip("0") if self.created_at else None,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }


class SavedFood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    food = db.Column(db.String(100), nullable=False, unique=True)  # unique: saving again updates, never duplicates
    verdict = db.Column(db.String(10), nullable=False)  # yes / no / maybe
    reason = db.Column(db.String(500))
    swap = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "food": self.food,
            "verdict": self.verdict,
            "reason": self.reason,
            "swap": self.swap,
        }


@app.route("/meals", methods=["GET"])
def get_meals():
    meals = Meal.query.all()
    return jsonify([meal.to_dict() for meal in meals])


@app.route("/meals", methods=["POST"])
def add_meal():
    data = request.get_json()
    meal = Meal(name=data["name"], calories=data.get("calories"), grams=data.get("grams"), meal_type=data.get("meal_type"))
    db.session.add(meal)
    db.session.commit()
    return jsonify(meal.to_dict()), 201


@app.route("/meals/<int:id>", methods=["PUT"])
def update_meal(id):
    meal = db.session.get(Meal, id)
    if meal is None:
        return jsonify({"error": "Meal not found"}), 404
    data = request.get_json()
    if "name" in data:
        meal.name = data["name"]
    if "calories" in data:
        meal.calories = data["calories"]
    if "grams" in data:
        meal.grams = data["grams"]
    if "meal_type" in data:
        meal.meal_type = data["meal_type"]
    db.session.commit()
    return jsonify(meal.to_dict())


@app.route("/meals/<int:id>", methods=["DELETE"])
def delete_meal(id):
    meal = db.session.get(Meal, id)
    if meal is None:
        return jsonify({"error": "Meal not found"}), 404
    db.session.delete(meal)
    db.session.commit()
    return jsonify({"deleted": id})


@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    symptoms = Symptom.query.all()
    return jsonify([symptom.to_dict() for symptom in symptoms])


@app.route("/symptoms", methods=["POST"])
def add_symptom():
    data = request.get_json()
    symptom = Symptom(
        type=data["type"],
        severity=data.get("severity"),
        body_part=data.get("body_part"),
        bristol_scale=data.get("bristol_scale"),
        notes=data.get("notes"),
    )
    db.session.add(symptom)
    db.session.commit()
    return jsonify(symptom.to_dict()), 201


@app.route("/symptoms/<int:id>", methods=["PUT"])
def update_symptom(id):
    symptom = db.session.get(Symptom, id)
    if symptom is None:
        return jsonify({"error": "Symptom not found"}), 404
    data = request.get_json()
    for field in ["type", "severity", "body_part", "bristol_scale", "notes"]:
        if field in data:
            setattr(symptom, field, data[field])
    db.session.commit()
    return jsonify(symptom.to_dict())


@app.route("/symptoms/<int:id>", methods=["DELETE"])
def delete_symptom(id):
    symptom = db.session.get(Symptom, id)
    if symptom is None:
        return jsonify({"error": "Symptom not found"}), 404
    db.session.delete(symptom)
    db.session.commit()
    return jsonify({"deleted": id})


@app.route("/weights", methods=["GET"])
def get_weights():
    weights = WeightEntry.query.all()
    return jsonify([w.to_dict() for w in weights])


@app.route("/weights", methods=["POST"])
def add_weight():
    data = request.get_json()
    weight = WeightEntry(weight=data["weight"])
    db.session.add(weight)
    db.session.commit()
    return jsonify(weight.to_dict()), 201


@app.route("/weights/<int:id>", methods=["PUT"])
def update_weight(id):
    weight = db.session.get(WeightEntry, id)
    if weight is None:
        return jsonify({"error": "Weight entry not found"}), 404
    data = request.get_json()
    if "weight" in data:
        weight.weight = data["weight"]
    db.session.commit()
    return jsonify(weight.to_dict())


@app.route("/weights/<int:id>", methods=["DELETE"])
def delete_weight(id):
    weight = db.session.get(WeightEntry, id)
    if weight is None:
        return jsonify({"error": "Weight entry not found"}), 404
    db.session.delete(weight)
    db.session.commit()
    return jsonify({"deleted": id})


# --- AIP food lookup -------------------------------------------------------

def ask_claude(system, user_message, schema, max_tokens):
    """Ask Claude Sonnet and get back a dict matching `schema` (None if Claude refuses)."""
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = client.beta.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
        output_config={
            "effort": "low",
            "format": {"type": "json_schema", "schema": schema},
        },
        # If Claude's safety check declines a request, retry it on another model
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if response.stop_reason == "refusal":
        return None
    text = next(block.text for block in response.content if block.type == "text")
    return json.loads(text)

AIP_LOOKUP_SCHEMA = {
    "type": "object",
    "properties": {
        "food": {"type": "string"},
        "verdict": {"type": "string", "enum": ["yes", "no", "maybe"]},
        "reason": {"type": "string"},
        "swap": {"type": "string"},
    },
    "required": ["food", "verdict", "reason", "swap"],
    "additionalProperties": False,
}

AIP_LOOKUP_PROMPT = """You are an expert on the Autoimmune Protocol (AIP) diet, elimination phase.
The user names a food. Decide whether it is allowed during the AIP elimination phase.

- verdict: "yes" if allowed, "no" if excluded, "maybe" if it depends (preparation, quantity, a specific variety, or experts disagree).
- reason: one short sentence explaining why, naming the relevant food group (e.g. nightshade, seed, grain, legume, dairy).
- swap: if the verdict is "no" or "maybe", one concrete AIP-friendly alternative that fills the same role in a meal. If "yes", leave it empty.
- food: the standard English name of the food, singular, capitalised, with typos corrected — even if the user wrote it in another language (e.g. "süßkartoffeln" → "Sweet potato"). The same food must always get the same name."""


@app.route("/aip/lookup", methods=["POST"])
def aip_lookup():
    food = (request.json or {}).get("food", "").strip()
    if not food:
        return jsonify({"error": "Please enter a food"}), 400

    result = ask_claude(AIP_LOOKUP_PROMPT, food, AIP_LOOKUP_SCHEMA, max_tokens=2000)
    if result is None:
        return jsonify({"error": "Couldn't look that one up. Try another food."}), 422
    return jsonify(result)


# --- AIP recipe suggestions ------------------------------------------------

AIP_RECIPES_SCHEMA = {
    "type": "object",
    "properties": {
        "recipes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "time": {"type": "string"},
                    "description": {"type": "string"},
                    "servings": {"type": "integer"},
                    "calories_per_serving": {"type": "integer"},
                    "ingredients": {"type": "array", "items": {"type": "string"}},
                    "steps": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["name", "time", "description", "servings", "calories_per_serving", "ingredients", "steps"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["recipes"],
    "additionalProperties": False,
}

AIP_RECIPES_PROMPT = """You are an expert cook for the Autoimmune Protocol (AIP) diet, elimination phase.
The user describes what they feel like eating. Suggest exactly 3 different recipes.

Every ingredient MUST be allowed during AIP elimination: no grains, legumes, dairy, eggs, nuts, seeds
(including seed-based spices like cumin, coriander seed, mustard, fennel seed), nightshades (tomato,
potato, peppers, aubergine, chilli, paprika, cayenne), refined sugar, seed oils, alcohol or additives.
Double-check every spice and sauce.

- name: short, appetising recipe name
- time: total time, e.g. "25 min"
- description: one sentence on what makes it good
- servings: how many people the ingredient quantities serve
- calories_per_serving: your best estimate of kcal per serving, calculated from the ingredient quantities
- ingredients: each with a quantity, e.g. "2 chicken thighs"
- steps: short, clear cooking steps in order"""


@app.route("/aip/recipes", methods=["POST"])
def aip_recipes():
    craving = (request.json or {}).get("craving", "").strip()
    if not craving:
        return jsonify({"error": "Tell me what you feel like eating"}), 400

    result = ask_claude(AIP_RECIPES_PROMPT, craving, AIP_RECIPES_SCHEMA, max_tokens=6000)
    if result is None:
        return jsonify({"error": "Couldn't come up with recipes for that. Try something else."}), 422
    return jsonify(result)


# --- Saved foods (personal safe / maybe / avoid list) ----------------------

@app.route("/saved-foods", methods=["GET"])
def get_saved_foods():
    saved = SavedFood.query.order_by(SavedFood.food).all()
    return jsonify([item.to_dict() for item in saved])


@app.route("/saved-foods", methods=["POST"])
def save_food():
    data = request.get_json()
    # Already saved? Update it instead of creating a duplicate
    item = SavedFood.query.filter_by(food=data["food"]).first()
    if item is None:
        item = SavedFood(food=data["food"])
        db.session.add(item)
    item.verdict = data["verdict"]
    item.reason = data.get("reason")
    item.swap = data.get("swap")
    db.session.commit()
    return jsonify(item.to_dict()), 201


@app.route("/saved-foods/<int:id>", methods=["DELETE"])
def delete_saved_food(id):
    item = db.session.get(SavedFood, id)
    if item is None:
        return jsonify({"error": "Saved food not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"deleted": id})


if __name__ == "__main__":
    app.run(debug=True)
