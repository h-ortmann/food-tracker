import { Routes, Route } from "react-router-dom"
import { Home } from "@/pages/Home"
import { Aip } from "@/pages/Aip"
import { Analysis } from "@/pages/Analysis"
import { BottomNav } from "@/components/BottomNav"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aip" element={<Aip />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export default App
