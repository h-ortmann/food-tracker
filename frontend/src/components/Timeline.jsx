import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SYMPTOM_META = {
  bloating: { icon: "🎈", label: "Bloating" },
  pain: { icon: "⚡", label: "Pain" },
  nausea: { icon: "🤢", label: "Nausea" },
  diarrhea: { icon: "💧", label: "Diarrhea" },
  stool: { icon: "💩", label: "Stool" },
}

function symptomDetail(symptom) {
  const meta = SYMPTOM_META[symptom.type] ?? { label: symptom.type }
  if (symptom.type === "stool") {
    return `${meta.label} — Bristol ${symptom.bristol_scale}`
  }
  if (symptom.type === "pain") {
    const part = symptom.body_part?.replace("_", " ")
    return `${meta.label} (${symptom.severity}/5) — ${part}`
  }
  return `${meta.label} (${symptom.severity}/5)`
}

export function Timeline({ meals, symptoms, weights }) {
  const entries = [
    ...meals.map((m) => ({
      kind: "meal",
      id: `meal-${m.id}`,
      timestamp: m.timestamp,
      time: m.created_at,
      icon: "🍽️",
      detail: `${m.name}${m.calories ? ` — ${m.calories} kcal` : ""}`,
    })),
    ...symptoms.map((s) => ({
      kind: "symptom",
      id: `symptom-${s.id}`,
      timestamp: s.timestamp,
      time: s.created_at,
      icon: SYMPTOM_META[s.type]?.icon ?? "🩺",
      detail: symptomDetail(s),
      notes: s.notes,
    })),
    ...weights.map((w) => ({
      kind: "weight",
      id: `weight-${w.id}`,
      timestamp: w.timestamp,
      time: w.created_at,
      icon: "⚖️",
      detail: `${w.weight} kg`,
    })),
  ]
    .filter((e) => e.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nothing logged yet today</p>
        ) : (
          <div className="flex flex-col">
            {entries.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-lg leading-none">{entry.icon}</span>
                  {i < entries.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm">{entry.detail}</p>
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground italic">"{entry.notes}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
