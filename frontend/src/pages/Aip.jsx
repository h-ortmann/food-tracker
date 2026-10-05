import { useEffect, useState } from "react"
import { SearchBox } from "@/components/SearchBox"
import { VerdictCard } from "@/components/VerdictCard"
import { SavedFoodsList } from "@/components/SavedFoodsList"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

// Fetch helper: turns a non-OK response into an error with the backend's message
function request(path, options) {
  return fetch(`${API_URL}${path}`, options)
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error)
      return data
    })
}

// Smart: owns the state and talks to the backend
export function Aip() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [savedFoods, setSavedFoods] = useState([])

  useEffect(() => {
    request("/saved-foods")
      .then(setSavedFoods)
      .catch(() => setError("Couldn't load your saved foods."))
  }, [])

  function lookUpFood(food) {
    setIsLoading(true)
    setError("")
    request("/aip/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ food }),
    })
      .then(setResult)
      .catch((err) => setError(err.message || "Something went wrong. Try again."))
      .finally(() => setIsLoading(false))
  }

  function saveFood() {
    request("/saved-foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    })
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
  )
}
