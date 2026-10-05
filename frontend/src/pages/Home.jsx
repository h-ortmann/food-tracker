import { useState, useEffect } from "react"
import { UtensilsCrossed, Stethoscope, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MealForm } from "@/components/MealForm"
import { SymptomForm } from "@/components/SymptomForm"
import { WeightForm } from "@/components/WeightForm"
import { Timeline } from "@/components/Timeline"
import { CalorieSummary } from "@/components/CalorieSummary"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

export function Home() {
  const [meals, setMeals] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [weights, setWeights] = useState([])
  const [calorieGoal, setCalorieGoal] = useState(null)

  const [mealSheetOpen, setMealSheetOpen] = useState(false)
  const [symptomSheetOpen, setSymptomSheetOpen] = useState(false)
  const [weightSheetOpen, setWeightSheetOpen] = useState(false)

  const [editingMealId, setEditingMealId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editCalories, setEditCalories] = useState("")
  const [editGrams, setEditGrams] = useState("")
  const [editMealType, setEditMealType] = useState("")

  const [editingSymptomId, setEditingSymptomId] = useState(null)

  const [editingWeightId, setEditingWeightId] = useState(null)
  const [editWeightValue, setEditWeightValue] = useState("")

  useEffect(() => {
    fetchMeals()
    fetchSymptoms()
    fetchWeights()
    fetchSettings()
  }, [])

  function fetchSettings() {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => setCalorieGoal(data.calorie_goal))
  }

  function saveCalorieGoal(goal) {
    fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calorie_goal: goal }),
    })
      .then((res) => res.json())
      .then((data) => setCalorieGoal(data.calorie_goal))
  }

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
    setEditGrams(meal.grams || "")
    setEditMealType(meal.meal_type || "")
  }

  function cancelEditMeal() {
    setEditingMealId(null)
  }

  function saveEditMeal(id) {
    fetch(`${API_URL}/meals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        calories: Number(editCalories),
        grams: Number(editGrams) || null,
        meal_type: editMealType,
      }),
    }).then(() => {
      setEditingMealId(null)
      fetchMeals()
    })
  }

  function deleteSymptom(id) {
    if (!window.confirm("Delete this symptom?")) return
    fetch(`${API_URL}/symptoms/${id}`, {
      method: "DELETE",
    }).then(() => fetchSymptoms())
  }

  function startEditSymptom(symptom) {
    setEditingSymptomId(symptom.id)
  }

  function cancelEditSymptom() {
    setEditingSymptomId(null)
  }

  function saveEditSymptom(id, data) {
    fetch(`${API_URL}/symptoms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      setEditingSymptomId(null)
      fetchSymptoms()
    })
  }

  function deleteWeight(id) {
    if (!window.confirm("Delete this weight entry?")) return
    fetch(`${API_URL}/weights/${id}`, {
      method: "DELETE",
    }).then(() => fetchWeights())
  }

  function startEditWeight(weight) {
    setEditingWeightId(weight.id)
    setEditWeightValue(weight.weight)
  }

  function cancelEditWeight() {
    setEditingWeightId(null)
  }

  function saveEditWeight(id) {
    fetch(`${API_URL}/weights/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: Number(editWeightValue) }),
    }).then(() => {
      setEditingWeightId(null)
      fetchWeights()
    })
  }

  // Today's date as YYYY-MM-DD in local time ("en-CA" happens to use that format)
  const today = new Date().toLocaleDateString("en-CA")
  const caloriesToday = meals
    .filter((meal) => meal.date === today)
    .reduce((sum, meal) => sum + (meal.calories || 0), 0)

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

      <CalorieSummary total={caloriesToday} goal={calorieGoal} onSaveGoal={saveCalorieGoal} />

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
        editGrams={editGrams}
        editMealType={editMealType}
        onEditNameChange={setEditName}
        onEditCaloriesChange={setEditCalories}
        onEditGramsChange={setEditGrams}
        onEditMealTypeChange={setEditMealType}
        onStartEditMeal={startEditMeal}
        onCancelEditMeal={cancelEditMeal}
        onSaveEditMeal={saveEditMeal}
        onDeleteMeal={deleteMeal}
        onAddMeal={addMeal}
        editingSymptomId={editingSymptomId}
        onStartEditSymptom={startEditSymptom}
        onCancelEditSymptom={cancelEditSymptom}
        onSaveEditSymptom={saveEditSymptom}
        onDeleteSymptom={deleteSymptom}
        editingWeightId={editingWeightId}
        editWeightValue={editWeightValue}
        onEditWeightValueChange={setEditWeightValue}
        onStartEditWeight={startEditWeight}
        onCancelEditWeight={cancelEditWeight}
        onSaveEditWeight={saveEditWeight}
        onDeleteWeight={deleteWeight}
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
