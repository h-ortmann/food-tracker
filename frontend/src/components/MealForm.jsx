import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MEAL_TYPE_META, MEAL_TYPE_ORDER } from "@/lib/mealTypes"

export function MealForm({ onAdd, onDone }) {
  const [mealType, setMealType] = useState("")
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [grams, setGrams] = useState("")
  const [loggedItems, setLoggedItems] = useState([])

  function handleAddItem() {
    if (!name) return
    onAdd({ name, calories: Number(calories) || 0, grams: Number(grams) || null, meal_type: mealType })
    setLoggedItems((prev) => [...prev, { name, calories, grams }])
    setName("")
    setCalories("")
    setGrams("")
  }

  function handleDone() {
    setMealType("")
    setName("")
    setCalories("")
    setGrams("")
    setLoggedItems([])
    onDone()
  }

  if (!mealType) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What kind of meal?</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {MEAL_TYPE_ORDER.map((type) => (
            <Button key={type} variant="outline" onClick={() => setMealType(type)}>
              {MEAL_TYPE_META[type].icon} {MEAL_TYPE_META[type].label}
            </Button>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {MEAL_TYPE_META[mealType].icon} Logging {MEAL_TYPE_META[mealType].label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loggedItems.length > 0 && (
          <div className="flex flex-col gap-1">
            {loggedItems.map((item, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                ✓ {item.name}{item.calories ? ` — ${item.calories} kcal` : ""}{item.grams ? ` (${item.grams}g)` : ""}
              </p>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Food name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-24"
          />
          <Input
            placeholder="Grams"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-20"
          />
          <Button onClick={handleAddItem}>Add</Button>
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setMealType("")}
            className="text-xs text-muted-foreground underline"
          >
            Change meal type
          </button>
          <Button variant="secondary" onClick={handleDone}>Done</Button>
        </div>
      </CardContent>
    </Card>
  )
}
