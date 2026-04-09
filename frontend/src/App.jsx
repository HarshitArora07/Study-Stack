import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import Landing from "./pages/Landing"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CodeHelper from "./pages/CodeHelper"
import Analysis from "./pages/Analysis"
import CheatSheet from "./pages/CheatSheet"
import History from "./pages/History"
import Performance from "./pages/Performance"
import GoogleSuccess from "./pages/GoogleSuccess"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/code-helper" element={<CodeHelper />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/cheatsheet" element={<CheatSheet />} />

        <Route path="/history" element={<History />} />
        <Route path="/performance" element={<Performance />} />

        <Route path="/auth/google/success" element={<GoogleSuccess />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App