import { NavLink } from "react-router-dom"
import { Home, Salad, TrendingUp } from "lucide-react"

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/aip", label: "AIP", icon: Salad },
  { to: "/analysis", label: "Analysis", icon: TrendingUp },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-background flex justify-around">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2.5 px-6 text-xs ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`
          }
        >
          <Icon className="size-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
