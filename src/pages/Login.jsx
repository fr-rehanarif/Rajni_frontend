import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(
    localStorage.getItem("rememberedUsername") || ""
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [loading, setLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkLogin, setDarkLogin] = useState(
    localStorage.getItem("darkLogin") === "true"
  );
  const [logoPreview, setLogoPreview] = useState(
    localStorage.getItem("shopLogo") || ""
  );
  const [clock, setClock] = useState("");
  const [lastLogin, setLastLogin] = useState(
    localStorage.getItem("lastLogin") || "First login"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setClock(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem("shopLogo", reader.result);
      setLogoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleDarkToggle = () => {
    const newValue = !darkLogin;
    setDarkLogin(newValue);
    localStorage.setItem("darkLogin", String(newValue));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Username and password required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedUsername");
      }

      const loginTime = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      localStorage.setItem("lastLogin", loginTime);
      setLastLogin(loginTime);

      setAccessGranted(true);

      setTimeout(() => {
        navigate("/app/dashboard", { replace: true });
      }, 1000);
    } catch (error) {
      alert("Invalid Username or Password");
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${darkLogin ? "login-dark" : ""}`}>
      <div className="gold-particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {accessGranted && (
        <div className="access-overlay">
          <div className="access-card">
            <div className="access-check">✓</div>
            <h2>Access Granted</h2>
            <p>Opening Rajni POS Command Center...</p>
          </div>
        </div>
      )}

      <button className="login-theme-toggle" onClick={handleDarkToggle}>
        {darkLogin ? "☀ Light" : "🌙 Dark"}
      </button>

      <div className="login-left">
        <div className="brand-badge">RAJNI SAREE CENTER</div>

        <h1>
          Rajni Saree Center
          <br />
          Command Center
        </h1>

        <p>
          Premium inventory, billing, customer management, reporting and
          business analytics platform.
        </p>

        <div className="login-clock-card">
          <span>Live Counter Time</span>
          <strong>{clock}</strong>
        </div>

        <div className="floating-login-stats">
          <div>
            <span>Products Managed</span>
            <strong>1245+</strong>
          </div>

          <div>
            <span>Bills Generated</span>
            <strong>15482+</strong>
          </div>

          <div>
            <span>Revenue Tracked</span>
            <strong>₹42L+</strong>
          </div>
        </div>

        <div className="feature-list">
          <div>✨ Smart Billing</div>
          <div>📦 Inventory Tracking</div>
          <div>📊 Business Reports</div>
          <div>👥 Customer Management</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card glass-login-card">
          <div className="login-logo-wrap">
            <div className="login-logo premium-logo-circle">
              {logoPreview ? <img src={logoPreview} alt="Shop Logo" /> : "R"}
            </div>

            <label className="logo-upload-btn">
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>

          <h2>Welcome Back</h2>
          <p>Secure Admin Access</p>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              disabled={loading}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember username</span>
            </label>

            <button className="login-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="security-row">
            <span className="server-dot"></span>
            Server Connected
          </div>

          <div className="last-login-text">
            Last Login: {lastLogin}
          </div>

          <div className="secure-tag">🔒 Protected Admin Access</div>
        </div>
      </div>
    </div>
  );
}

export default Login;