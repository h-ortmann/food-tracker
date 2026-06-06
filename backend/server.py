from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///food_tracker.db"
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    calories = db.Column(db.Integer)
    meal_type = db.Column(db.String(50))
    date = db.Column(db.Date, default=datetime.date.today)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "calories": self.calories,
            "meal_type": self.meal_type,
            "date": self.date.isoformat() if self.date else None,
        }


with app.app_context():
    db.create_all()


@app.route("/meals", methods=["GET"])
def get_meals():
    meals = Meal.query.all()
    return jsonify([meal.to_dict() for meal in meals])


@app.route("/meals", methods=["POST"])
def add_meal():
    data = request.get_json()
    meal = Meal(name=data["name"], calories=data.get("calories"), meal_type=data.get("meal_type"))
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


if __name__ == "__main__":
    app.run(debug=True)
