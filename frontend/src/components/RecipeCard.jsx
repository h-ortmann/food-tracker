import { useState } from "react"
import { ChevronDown, Clock, Flame, Users } from "lucide-react"
import { Card } from "@/components/ui/card"

// Dumb: shows one recipe; owns only whether it's expanded
export function RecipeCard({ recipe }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="py-0 gap-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-start gap-3 text-left p-4 hover:bg-muted"
      >
        <div className="flex-1">
          <p className="font-semibold">{recipe.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Clock className="size-3.5" /> {recipe.time}</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Flame className="size-3.5" /> ~{recipe.calories_per_serving} kcal per serving
            </span>
            <span className="flex items-center gap-1"><Users className="size-3.5" /> serves {recipe.servings}</span>
          </div>
        </div>
        <ChevronDown className={`size-4 mt-1 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t p-4 flex flex-col gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Ingredients</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {recipe.ingredients.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Steps</h4>
            <ol className="list-decimal pl-5 flex flex-col gap-2">
              {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </div>
      )}
    </Card>
  )
}
