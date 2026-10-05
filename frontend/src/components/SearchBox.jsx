import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Dumb: collects what the user typed and hands it up via onSearch
export function SearchBox({ onSearch, isLoading }) {
  const [text, setText] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSearch(text.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Is it AIP? e.g. tomato, quinoa…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-12"
      />
      <Button type="submit" className="h-12 px-5" disabled={isLoading}>
        <Search className="size-4" />
        {isLoading ? "Checking…" : "Check"}
      </Button>
    </form>
  )
}
