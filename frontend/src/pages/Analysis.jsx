import { TrendingUp } from "lucide-react"

export function Analysis() {
  return (
    <div className="max-w-lg mx-auto p-6 pb-24 flex flex-col items-center gap-3 py-24 text-muted-foreground">
      <TrendingUp className="size-10" />
      <p className="text-sm">Trend analysis coming once there's enough logged data</p>
    </div>
  )
}
