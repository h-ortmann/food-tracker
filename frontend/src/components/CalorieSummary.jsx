import { useState } from "react"
import { Flame, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Dumb: shows today's calories against the goal; hands a new goal up via onSaveGoal.
// Owns only whether the goal is being edited.
export function CalorieSummary({ total, goal, onSaveGoal }) {
  const [isEditing, setIsEditing] = useState(false)
  const [goalInput, setGoalInput] = useState("")

  function startEditing() {
    setGoalInput(goal ? String(goal) : "")
    setIsEditing(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const value = parseInt(goalInput, 10)
    onSaveGoal(value > 0 ? value : null)
    setIsEditing(false)
  }

  const percent = goal ? Math.round((total / goal) * 100) : 0
  // Within 10% of the goal counts as "on target"
  const status = !goal ? null : percent < 90 ? "under" : percent <= 110 ? "on" : "over"
  const barColour = { under: "bg-primary", on: "bg-green-600", over: "bg-amber-500" }[status]
  const difference = goal ? Math.abs(goal - total) : 0
  const caption = {
    under: `${difference.toLocaleString()} kcal to go`,
    on: "On target 🎉",
    over: `${difference.toLocaleString()} kcal over`,
  }[status]

  return (
    <Card className="mb-6 py-4">
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="flex items-baseline gap-1.5">
            <Flame className="size-4 self-center text-muted-foreground" />
            <span className="text-2xl font-bold">{total.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">
              {goal ? `/ ${goal.toLocaleString()} kcal today` : "kcal today"}
            </span>
          </p>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={startEditing}>
              {goal ? <Pencil className="size-3.5" /> : null}
              {goal ? "Goal" : "Set goal"}
            </Button>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Daily goal, e.g. 1800"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              autoFocus
            />
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          </form>
        )}

        {goal && (
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColour}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{caption}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
