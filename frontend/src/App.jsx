import { useState, useEffect } from "react"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SymptomForm } from "@/components/SymptomForm"
import { WeightForm } from "@/components/WeightForm"
import { Timeline } from "@/components/Timeline"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
const MEAL_TYPE_ORDER = ["breakfast", "lunch", "dinner", "snack", "drink"]

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function App() {
  const [meals, setMeals] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [weights, setWeights] = useState([])
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [mealType, setMealType] = useState("")
  const [editingMealId, setEditingMealId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editCalories, setEditCalories] = useState("")
  const [editMealType, setEditMealType] = useState("")

  useEffect(() => {
    fetchMeals()
    fetchSymptoms()
    fetchWeights()
  }, [])

  function fetchMeals() {
    fetch(`${API_URL}/meals`)
      .then((res) => res.json())
      .then((data) => setMeals(data))
  }

  function fetchSymptoms() {
    fetch(`${API_URL}/symptoms`)
      .then((res) => res.json())
      .then((data) => setSymptoms(data))
  }

  function fetchWeights() {
    fetch(`${API_URL}/weights`)
      .then((res) => res.json())
      .then((data) => setWeights(data))
  }

  function addSymptom(symptom) {
    fetch(`${API_URL}/symptoms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(symptom),
    }).then(() => fetchSymptoms())
  }

  function addWeight(weight) {
    fetch(`${API_URL}/weights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight }),
    }).then(() => fetchWeights())
  }

  function addMeal() {
    fetch(`${API_URL}/meals`, {
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
    fetch(`${API_URL}/meals/${id}`, {
      method: "DELETE",
    }).then(() => fetchMeals())
  }

  function startEditMeal(meal) {
    setEditingMealId(meal.id)
    setEditName(meal.name)
    setEditCalories(meal.calories)
    setEditMealType(meal.meal_type || "")
  }

  function cancelEditMeal() {
    setEditingMealId(null)
  }

  function saveEditMeal(id) {
    fetch(`${API_URL}/meals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, calories: Number(editCalories), meal_type: editMealType }),
    }).then(() => {
      setEditingMealId(null)
      fetchMeals()
    })
  }

  const grouped = {}
  MEAL_TYPE_ORDER.forEach(type => {
    const group = meals.filter(m => m.meal_type === type)
    if (group.length > 0) grouped[type] = group
  })
  const other = meals.filter(m => !m.meal_type || !MEAL_TYPE_ORDER.includes(m.meal_type))
  if (other.length > 0) grouped["other"] = other

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Food Tracker</h1>

      <Timeline meals={meals} symptoms={symptoms} weights={weights} />

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

      <SymptomForm onAdd={addSymptom} />
      <WeightForm onAdd={addWeight} />

      <div className="flex justify-between items-center mb-4">
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
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([type, groupMeals]) => (
            <Card key={type}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm">{capitalize(type)}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col p-0">
                {groupMeals.map((meal, i) => (
                  <div key={meal.id}>
                    {i > 0 && <div className="mx-4 border-b" />}
                    {editingMealId === meal.id ? (
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                        <Input
                          value={editCalories}
                          onChange={(e) => setEditCalories(e.target.value)}
                          className="h-8 w-20"
                        />
                        <select
                          value={editMealType}
                          onChange={(e) => setEditMealType(e.target.value)}
                          className="h-8 rounded-lg border border-input px-2.5 py-1 text-sm bg-transparent"
                        >
                          <option value="">Type</option>
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                          <option value="drink">Drink</option>
                        </select>
                        <Button variant="outline" size="icon" onClick={() => saveEditMeal(meal.id)}>
                          <Check className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={cancelEditMeal}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-2">
                        <div>
                          <p className="text-sm">{meal.name}</p>
                          {meal.created_at && (
                            <p className="text-xs text-muted-foreground">{meal.created_at}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{meal.calories} kcal</span>
                          <Button variant="outline" size="icon" onClick={() => startEditMeal(meal)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deleteMeal(meal.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
