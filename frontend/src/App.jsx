import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  const [meals, setMeals] = useState([])
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [mealType, setMealType] = useState("")

  useEffect(() => {
    fetchMeals()
  }, [])

  function fetchMeals() {
    fetch("http://127.0.0.1:5000/meals")
      .then((res) => res.json())
      .then((data) => setMeals(data))
  }

  function addMeal() {
    fetch("http://127.0.0.1:5000/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, calories: Number(calories), meal_type: mealType }),
    }).then(() => {
      setName("")
      setCalories("")
      setMealType("")
      fetchMeals()
    })
  }

  function deleteMeal(id) {
    fetch(`http://127.0.0.1:5000/meals/${id}`, {
      method: "DELETE",
    }).then(() => fetchMeals())
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Food Tracker</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log a meal</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Meal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-28"
          />
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className={`h-8 rounded-lg border border-input px-2.5 py-1 text-sm bg-transparent ${mealType === "" ? "text-muted-foreground" : ""}`}
          >
            <option value="">Type</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="drink">Drink</option>
          </select>
          <Button onClick={addMeal}>Add</Button>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Today's meals</span>
        <span className="text-muted-foreground text-sm">
          Total: {meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
        </span>
      </div>

      {meals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <span className="text-5xl">🍽️</span>
          <p className="text-sm">No meals logged yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <CardContent className="flex justify-between items-center py-3">
                <div>
                  <span>{meal.name}</span>
                  {meal.meal_type && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{meal.calories} kcal</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteMeal(meal.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
