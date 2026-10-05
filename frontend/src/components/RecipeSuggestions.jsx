import { useState } from "react"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecipeCard } from "@/components/RecipeCard"
import { postJson } from "@/lib/api"

// Smart: owns the craving text, the recipes and the loading/error state
export function RecipeSuggestions() {
  const [craving, setCraving] = useState("")
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!craving.trim()) return
    setIsLoading(true)
    setError("")
    postJson("/aip/recipes", { craving: craving.trim() })
      .then((data) => setRecipes(data.recipes))
      .catch((err) => setError(err.message || "Something went wrong. Try again."))
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="What do you feel like? e.g. quick warm dinner"
          value={craving}
          onChange={(e) => setCraving(e.target.value)}
          className="h-12"
        />
        <Button type="submit" className="h-12 px-5" disabled={isLoading}>
          <ChefHat className="size-4" />
          {isLoading ? "Cooking…" : "Suggest"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Coming up with 3 AIP recipes… this takes about 15 seconds.</p>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recipes.map((recipe) => <RecipeCard key={recipe.name} recipe={recipe} />)}
        </div>
      )}
    </div>
  )
}
