import { ArrowRightLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const VERDICTS = {
  yes: { emoji: "✅", label: "Yes", style: "bg-green-100 text-green-800 border-green-300" },
  no: { emoji: "❌", label: "No", style: "bg-red-100 text-red-800 border-red-300" },
  maybe: { emoji: "⚠️", label: "Maybe", style: "bg-amber-100 text-amber-900 border-amber-300" },
}

// Dumb: displays whatever result it's given
export function VerdictCard({ result }) {
  const verdict = VERDICTS[result.verdict]

  return (
    <Card className="pt-0">
      <div className={`flex items-center gap-4 p-6 border-b ${verdict.style}`}>
        <span className="text-5xl">{verdict.emoji}</span>
        <div>
          <p className="text-4xl font-extrabold leading-none">{verdict.label}</p>
          <p className="text-lg font-medium mt-1">{result.food}</p>
        </div>
      </div>
      <CardContent className="flex flex-col gap-4 pt-4">
        <p className="text-sm text-muted-foreground">{result.reason}</p>
        {result.swap && (
          <div className="flex gap-3 items-start rounded-lg bg-muted p-3">
            <ArrowRightLeft className="size-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">Try instead: </span>
              {result.swap}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
