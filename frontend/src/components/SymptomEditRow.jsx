import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleRow } from "@/components/ToggleRow"
import { SYMPTOM_TYPES, BODY_PARTS, SEVERITY_SCALE, BRISTOL_SCALE } from "@/lib/symptomTypes"

export function SymptomEditRow({ symptom, onSave, onCancel }) {
  const [type, setType] = useState(symptom.type)
  const [severity, setSeverity] = useState(symptom.severity)
  const [bodyPart, setBodyPart] = useState(symptom.body_part)
  const [bristolScale, setBristolScale] = useState(symptom.bristol_scale)
  const [notes, setNotes] = useState(symptom.notes || "")

  function handleSave() {
    onSave({
      type,
      severity,
      body_part: bodyPart,
      bristol_scale: bristolScale,
      notes: notes || null,
    })
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value)
          setSeverity(null)
          setBodyPart(null)
          setBristolScale(null)
        }}
        className="h-8 rounded-lg border border-input px-2.5 py-1 text-sm bg-transparent"
      >
        {SYMPTOM_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {type === "pain" && (
        <ToggleRow options={BODY_PARTS} value={bodyPart} onChange={setBodyPart} />
      )}

      {type === "stool" ? (
        <ToggleRow options={BRISTOL_SCALE} value={bristolScale} onChange={setBristolScale} />
      ) : (
        <ToggleRow options={SEVERITY_SCALE} value={severity} onChange={setSeverity} />
      )}

      <Input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-8"
      />

      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={handleSave}>
          <Check className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
