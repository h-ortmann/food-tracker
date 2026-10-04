import { useState } from "react"
import { Pencil, Trash2, Check, X, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MEAL_TYPE_META, OTHER_MEAL_META } from "@/lib/mealTypes"

const SYMPTOM_META = {
  bloating: { icon: "🎈", label: "Bloating" },
  pain: { icon: "⚡", label: "Pain" },
  nausea: { icon: "🤢", label: "Nausea" },
  diarrhea: { icon: "💧", label: "Diarrhea" },
  stool: { icon: "💩", label: "Stool" },
}

function symptomDetail(symptom) {
  const meta = SYMPTOM_META[symptom.type] ?? { label: symptom.type }
  if (symptom.type === "stool") {
    return `${meta.label} — Bristol ${symptom.bristol_scale}`
  }
  if (symptom.type === "pain") {
    const part = symptom.body_part?.replace("_", " ")
    return `${meta.label} (${symptom.severity}/5) — ${part}`
  }
  return `${meta.label} (${symptom.severity}/5)`
}

function groupMeals(meals) {
  const groups = {}
  meals.forEach((m) => {
    const key = `${m.date}_${m.meal_type || "other"}`
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  })
  return Object.entries(groups).map(([key, items]) => {
    const sorted = [...items].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    const meta = MEAL_TYPE_META[sorted[0].meal_type] ?? OTHER_MEAL_META
    return {
      kind: "mealGroup",
      id: `mealgroup-${key}`,
      timestamp: sorted[0].timestamp,
      time: sorted[0].created_at,
      icon: meta.icon,
      label: meta.label,
      names: sorted.map((m) => m.name).join(", "),
      totalCalories: sorted.reduce((sum, m) => sum + (m.calories || 0), 0),
      items: sorted,
    }
  })
}

function MealEditRow({ editName, editCalories, editMealType, onEditNameChange, onEditCaloriesChange, onEditMealTypeChange, onSave, onCancel }) {
  return (
    <div className="flex items-center gap-2 py-1 flex-wrap">
      <Input value={editName} onChange={(e) => onEditNameChange(e.target.value)} className="h-8" />
      <Input value={editCalories} onChange={(e) => onEditCaloriesChange(e.target.value)} className="h-8 w-20" />
      <select
        value={editMealType}
        onChange={(e) => onEditMealTypeChange(e.target.value)}
        className="h-8 rounded-lg border border-input px-2.5 py-1 text-sm bg-transparent"
      >
        <option value="">Type</option>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
        <option value="drink">Drink</option>
      </select>
      <Button variant="outline" size="icon" onClick={onSave}>
        <Check className="size-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onCancel}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

export function Timeline({
  meals,
  symptoms,
  weights,
  editingMealId,
  editName,
  editCalories,
  editMealType,
  onEditNameChange,
  onEditCaloriesChange,
  onEditMealTypeChange,
  onStartEditMeal,
  onCancelEditMeal,
  onSaveEditMeal,
  onDeleteMeal,
  onAddMeal,
}) {
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [addingToGroupId, setAddingToGroupId] = useState(null)
  const [addName, setAddName] = useState("")
  const [addCalories, setAddCalories] = useState("")

  function startAddToGroup(groupId) {
    setAddingToGroupId(groupId)
    setAddName("")
    setAddCalories("")
  }

  function confirmAddToGroup(mealType) {
    if (!addName) return
    onAddMeal({ name: addName, calories: Number(addCalories) || 0, meal_type: mealType })
    setAddingToGroupId(null)
  }

  function toggleGroup(id) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const entries = [
    ...groupMeals(meals),
    ...symptoms.map((s) => ({
      kind: "symptom",
      id: `symptom-${s.id}`,
      timestamp: s.timestamp,
      time: s.created_at,
      icon: SYMPTOM_META[s.type]?.icon ?? "🩺",
      detail: symptomDetail(s),
      notes: s.notes,
    })),
    ...weights.map((w) => ({
      kind: "weight",
      id: `weight-${w.id}`,
      timestamp: w.timestamp,
      time: w.created_at,
      icon: "⚖️",
      detail: `${w.weight} kg`,
    })),
  ]
    .filter((e) => e.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nothing logged yet today</p>
        ) : (
          <div className="flex flex-col">
            {entries.map((entry, i) => {
              const isExpanded =
                entry.kind === "mealGroup" &&
                (expandedGroups.has(entry.id) || entry.items.some((m) => m.id === editingMealId))

              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-lg leading-none">{entry.icon}</span>
                    {i < entries.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>

                  {entry.kind === "mealGroup" ? (
                    <div className="pb-4 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleGroup(entry.id)}
                        className="flex justify-between items-start gap-3 w-full text-left"
                      >
                        <div>
                          <p className="text-sm">
                            {entry.label} — {entry.names}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.time}
                            {entry.totalCalories ? ` · ${entry.totalCalories} kcal` : ""}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-1 mt-2 pl-3 border-l">
                          {entry.items.map((m) =>
                            editingMealId === m.id ? (
                              <MealEditRow
                                key={m.id}
                                editName={editName}
                                editCalories={editCalories}
                                editMealType={editMealType}
                                onEditNameChange={onEditNameChange}
                                onEditCaloriesChange={onEditCaloriesChange}
                                onEditMealTypeChange={onEditMealTypeChange}
                                onSave={() => onSaveEditMeal(m.id)}
                                onCancel={onCancelEditMeal}
                              />
                            ) : (
                              <div key={m.id} className="flex justify-between items-center gap-3 py-1">
                                <span className="text-sm">
                                  {m.name}{m.calories ? ` — ${m.calories} kcal` : ""}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button variant="outline" size="icon" className="size-7" onClick={() => onStartEditMeal(m)}>
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="size-7" onClick={() => onDeleteMeal(m.id)}>
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                          {addingToGroupId === entry.id ? (
                            <div className="flex items-center gap-2 py-1 flex-wrap">
                              <Input
                                placeholder="Food name"
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                className="h-8"
                              />
                              <Input
                                placeholder="Calories"
                                value={addCalories}
                                onChange={(e) => setAddCalories(e.target.value)}
                                className="h-8 w-20"
                              />
                              <Button variant="outline" size="icon" onClick={() => confirmAddToGroup(entry.items[0].meal_type)}>
                                <Check className="size-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => setAddingToGroupId(null)}>
                                <X className="size-4" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startAddToGroup(entry.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground py-1"
                            >
                              <Plus className="size-3.5" /> Add item
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pb-4 flex-1">
                      <p className="text-sm">{entry.detail}</p>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground italic">"{entry.notes}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">{entry.time}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
