import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WeightForm({ onAdd }) {
  const [weight, setWeight] = useState("")

  function handleAdd() {
    if (!weight) return
    onAdd(Number(weight))
    setWeight("")
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Log your weight</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-32"
        />
        <Button onClick={handleAdd}>Add</Button>
      </CardContent>
    </Card>
  )
}
