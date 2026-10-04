import { Button } from "@/components/ui/button"

export function ToggleRow({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => {
        const optValue = typeof opt === "object" ? opt.value : opt
        const optLabel = typeof opt === "object" ? (opt.label ?? opt.value) : opt
        const optTitle = typeof opt === "object" ? opt.title : undefined
        return (
          <Button
            key={optValue}
            type="button"
            size="sm"
            variant={value === optValue ? "default" : "outline"}
            title={optTitle}
            onClick={() => onChange(optValue)}
          >
            {optLabel}
          </Button>
        )
      })}
    </div>
  )
}
