from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy.pool import NullPool
import datetime
import os

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


if __name__ == "__main__":
    app.run(debug=True)
