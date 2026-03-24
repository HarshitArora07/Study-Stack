import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function GoogleSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get("token")
    const name = params.get("name")
    const email = params.get("email")

    if (token) {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify({ name, email }))

      // ✅ IMPORTANT
      localStorage.setItem("guest", "false")

      navigate("/home")
    } else {
      navigate("/login")
    }
  }, [])

  return <div>Logging you in...</div>
}

export default GoogleSuccess