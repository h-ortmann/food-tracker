import { useState, useEffect } from "react"
import { UtensilsCrossed, Stethoscope, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MealForm } from "@/components/MealForm"
import { SymptomForm } from "@/components/SymptomForm"
import { WeightForm } from "@/components/WeightForm"
import { Timeline } from "@/components/Timeline"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

export function Home() {
  const [meals, setMeals] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [weights, setWeights] = useState([])

  const [mealSheetOpen, setMealSheetOpen] = useState(false)
  const [symptomSheetOpen, setSymptomSheetOpen] = useState(false)
  const [weightSheetOpen, setWeightSheetOpen] = useState(false)

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

  function addMeal(meal) {
    fetch(`${API_URL}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meal),
    }).then(() => fetchMeals())
  }

  function addSymptom(symptom) {
    fetch(`${API_URL}/symptoms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(symptom),
    }).then(() => {
      fetchSymptoms()
      setSymptomSheetOpen(false)
    })
  }

  function addWeight(weight) {
    fetch(`${API_URL}/weights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight }),
    }).then(() => {
      fetchWeights()
      setWeightSheetOpen(false)
    })
  }

  function deleteMeal(id) {
    if (!window.confirm("Delete this meal?")) return
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

  const lastWeight = weights.length > 0 ? weights[weights.length - 1] : null

  return (
    <div className="max-w-lg mx-auto p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Food Tracker</h1>
        <Button variant="outline" size="sm" onClick={() => setWeightSheetOpen(true)}>
          <Scale className="size-4" />
          {lastWeight ? `${lastWeight.weight} kg` : "Log weight"}
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <Button className="flex-1 h-14 flex-col gap-1" onClick={() => setMealSheetOpen(true)}>
          <UtensilsCrossed className="size-5" />
          Log meal
        </Button>
        <Button className="flex-1 h-14 flex-col gap-1" variant="secondary" onClick={() => setSymptomSheetOpen(true)}>
          <Stethoscope className="size-5" />
          Log symptom
        </Button>
      </div>

      <Timeline
        meals={meals}
        symptoms={symptoms}
        weights={weights}
        editingMealId={editingMealId}
        editName={editName}
        editCalories={editCalories}
        editMealType={editMealType}
        onEditNameChange={setEditName}
        onEditCaloriesChange={setEditCalories}
        onEditMealTypeChange={setEditMealType}
        onStartEditMeal={startEditMeal}
        onCancelEditMeal={cancelEditMeal}
        onSaveEditMeal={saveEditMeal}
        onDeleteMeal={deleteMeal}
        onAddMeal={addMeal}
      />

      <Sheet open={mealSheetOpen} onOpenChange={setMealSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Log a meal</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <MealForm key={mealSheetOpen} onAdd={addMeal} onDone={() => setMealSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={symptomSheetOpen} onOpenChange={setSymptomSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Log a symptom</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <SymptomForm onAdd={addSymptom} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={weightSheetOpen} onOpenChange={setWeightSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Log your weight</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <WeightForm onAdd={addWeight} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
