import { useEffect, useState } from "react"
import { SearchBox } from "@/components/SearchBox"
import { VerdictCard } from "@/components/VerdictCard"
import { SavedFoodsList } from "@/components/SavedFoodsList"
import { RecipeSuggestions } from "@/components/RecipeSuggestions"
import { request, postJson } from "@/lib/api"

// Smart: owns the state and talks to the backend
export function Aip() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [savedFoods, setSavedFoods] = useState([])
  const [view, setView] = useState("check") // "check" | "recipes"

  useEffect(() => {
    request("/saved-foods")
      .then(setSavedFoods)
      .catch(() => setError("Couldn't load your saved foods."))
  }, [])

  function lookUpFood(food) {
    setIsLoading(true)
    setError("")
    postJson("/aip/lookup", { food })
      .then(setResult)
      .catch((err) => setError(err.message || "Something went wrong. Try again."))
      .finally(() => setIsLoading(false))
  }

  function saveFood() {
    postJson("/saved-foods", result)
      .then((saved) =>
        // Replace the old entry if this food was already saved, otherwise add it
        setSavedFoods((prev) => [...prev.filter((item) => item.id !== saved.id), saved]
          .sort((a, b) => a.food.localeCompare(b.food)))
      )
      .catch(() => setError("Couldn't save. Try again."))
  }

  function deleteSavedFood(id) {
    if (!window.confirm("Remove this food from your list?")) return
    request(`/saved-foods/${id}`, { method: "DELETE" })
      .then(() => setSavedFoods((prev) => prev.filter((item) => item.id !== id)))
      .catch(() => setError("Couldn't remove. Try again."))
  }

  // Saved = same food with the same verdict already in the list
  const isSaved = result && savedFoods.some(
    (item) => item.food === result.food && item.verdict === result.verdict
  )

  return (
    <div className="max-w-lg sm:max-w-3xl mx-auto p-6 pb-24 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">AIP</h1>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="tablist">
        {[["check", "Check a food"], ["recipes", "Recipes"]].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              view === key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Both views stay mounted (just hidden) so switching tabs keeps results */}
      <div className={`${view === "check" ? "flex" : "hidden"} flex-col gap-6`}>
        <SearchBox onSearch={lookUpFood} isLoading={isLoading} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        {result && <VerdictCard result={result} isSaved={isSaved} onSave={saveFood} />}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">My foods</h2>
          <SavedFoodsList
            savedFoods={savedFoods}
            onSelect={(item) => { setResult(item); window.scrollTo({ top: 0, behavior: "smooth" }) }}
            onDelete={deleteSavedFood}
          />
        </div>
      </div>

      <div className={view === "recipes" ? "" : "hidden"}>
        <RecipeSuggestions />
      </div>
    </div>
  )
}
