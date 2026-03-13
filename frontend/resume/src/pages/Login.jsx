import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const login = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });
      // backend always returns `message: "Login success"` on success, but we
      // also check for presence of a user object in case the text changes
      if (res.status === 200 && res.data.user) {
        localStorage.setItem("loggedIn", "true");
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // check for registration success message passed via navigate
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state && state.message) {
      setSuccess(state.message);
    }
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Login to your ResumeAI account</p>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <input
          className="input-field"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-primary" onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}