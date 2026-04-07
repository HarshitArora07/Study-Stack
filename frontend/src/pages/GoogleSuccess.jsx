import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function GoogleSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [status, setStatus] = useState("Logging you in...")

  useEffect(() => {
    const token = params.get("token")
    const name  = params.get("name")
    const email = params.get("email")

    console.log("GoogleSuccess mounted")
    console.log("token:", token)
    console.log("name:", name)
    console.log("email:", email)

    if (token) {
      localStorage.removeItem("guest")
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify({ name, email }))
      localStorage.setItem("guest", "false")
      setStatus("Success! Redirecting...")
      navigate("/home", { replace: true })
    } else {
      setStatus("Login failed. Redirecting to login...")
      navigate("/login", { replace: true })
    }
  }, []) // ← empty deps, run once on mount only

  return (
    <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
      {status}
    </div>
  )
}

export default GoogleSuccess