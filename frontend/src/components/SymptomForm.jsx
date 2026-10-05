import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleRow } from "@/components/ToggleRow"
import { SYMPTOM_TYPES, BODY_PARTS, SEVERITY_SCALE, BRISTOL_SCALE, FLOW_SCALE } from "@/lib/symptomTypes"

export function SymptomForm({ onAdd }) {
  const [type, setType] = useState("")
  const [severity, setSeverity] = useState(null)
  const [bodyPart, setBodyPart] = useState(null)
  const [bristolScale, setBristolScale] = useState(null)
  const [notes, setNotes] = useState("")

  function reset() {
    setType("")
    setSeverity(null)
    setBodyPart(null)
    setBristolScale(null)
    setNotes("")
  }

  function handleAdd() {
    onAdd({
      type,
      severity,
      body_part: bodyPart,
      bristol_scale: bristolScale,
      notes: notes || null,
    })
    reset()
  }

  const canAdd =
    type &&
    (type === "pain" ? bodyPart : true) &&
    (type === "stool" ? bristolScale : true) &&
    (type === "period" ? severity : true)

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Log a symptom</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setSeverity(null)
            setBodyPart(null)
            setBristolScale(null)
          }}
          className={`h-8 rounded-lg border border-input px-2.5 py-1 text-sm bg-transparent ${type === "" ? "text-muted-foreground" : ""}`}
        >
          <option value="">Symptom type</option>
          {SYMPTOM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {type === "pain" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Where?</span>
            <ToggleRow options={BODY_PARTS} value={bodyPart} onChange={setBodyPart} />
          </div>
        )}

        {type === "stool" ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Bristol scale (hover for description)</span>
            <ToggleRow options={BRISTOL_SCALE} value={bristolScale} onChange={setBristolScale} />
          </div>
        ) : type === "period" ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Flow</span>
            <ToggleRow options={FLOW_SCALE} value={severity} onChange={setSeverity} />
          </div>
        ) : type ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Severity</span>
            <ToggleRow options={SEVERITY_SCALE} value={severity} onChange={setSeverity} />
          </div>
        ) : null}

        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button onClick={handleAdd} disabled={!canAdd} className="self-start">
          Add
        </Button>
      </CardContent>
    </Card>
  )
}
