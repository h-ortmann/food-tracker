import { useState } from "react"
import { SearchBox } from "@/components/SearchBox"
import { VerdictCard } from "@/components/VerdictCard"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

// Smart: owns the state and talks to the backend
export function Aip() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  function lookUpFood(food) {
    setIsLoading(true)
    setError("")
    fetch(`${API_URL}/aip/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ food }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error)
        setResult(data)
      })
      .catch((err) => setError(err.message || "Something went wrong. Try again."))
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="max-w-lg mx-auto p-6 pb-24 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">AIP</h1>
      <SearchBox onSearch={lookUpFood} isLoading={isLoading} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result && <VerdictCard result={result} />}
    </div>
  )
}
