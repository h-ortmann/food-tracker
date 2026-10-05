import { useState } from "react"
import { ChevronDown, Trash2 } from "lucide-react"
import { VERDICTS, VERDICT_ORDER } from "@/lib/verdicts"

// Dumb about data: shows saved foods grouped by verdict, hands taps up via onSelect/onDelete.
// Owns only its own open/closed UI state (like Timeline's expand/collapse).
// Phone: stacked, collapsible groups. Desktop (sm+): three always-open columns.
export function SavedFoodsList({ savedFoods, onSelect, onDelete }) {
  const [openGroups, setOpenGroups] = useState(new Set())

  function toggleGroup(verdict) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      next.has(verdict) ? next.delete(verdict) : next.add(verdict)
      return next
    })
  }

  if (savedFoods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved foods yet. Check a food, then tap Save to keep it here.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-8 items-start">
      {VERDICT_ORDER.map((verdict) => {
        const items = savedFoods.filter((item) => item.verdict === verdict)
        const meta = VERDICTS[verdict]
        const isOpen = openGroups.has(verdict)
        return (
          <section key={verdict} className="min-w-0">
            <button
              onClick={() => toggleGroup(verdict)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between rounded-lg border bg-card px-4 py-3 sm:pointer-events-none sm:border-0 sm:bg-transparent sm:p-0 sm:mb-2"
            >
              <span className="font-semibold">
                {meta.emoji} {meta.group} <span className="text-muted-foreground font-normal">· {items.length}</span>
              </span>
              <ChevronDown className={`size-4 transition-transform sm:hidden ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`${isOpen ? "block" : "hidden"} mt-2 sm:mt-0 sm:block`}>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">None yet</p>
              ) : (
                <ul className="flex flex-col divide-y rounded-lg border bg-card">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center">
                      <button
                        onClick={() => onSelect(item)}
                        className="flex-1 min-w-0 text-left px-4 py-3 hover:bg-muted rounded-l-lg break-words"
                      >
                        {item.food}
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        aria-label={`Remove ${item.food}`}
                        className="p-3 text-muted-foreground hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
