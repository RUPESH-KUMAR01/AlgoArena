import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/auth/signin", { email, password });

      // Save token and username to localStorage
      localStorage.setItem("token", response.data.token);
      if (response.data.username) {
        localStorage.setItem("username", response.data.username);

        console.log(response.data.token);
        navigate("/create-join"); // Navigate to create-join page
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);

        // Extract error message(s)
        let errorMessage = "Login failed. Please try again later.";

        if (typeof error.response.data === "string") {
          // Handle string responses
          errorMessage = error.response.data;
        } else if (typeof error.response.data === "object") {
          // Handle object responses
          errorMessage = error.response.data.message || errorMessage;
        }

        // Handle specific error cases
        if (errorMessage.toLowerCase().includes("user not found")) {
          toast.error("New user? Sign up first!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (errorMessage.toLowerCase().includes("invalid password")) {
          toast.error("Invalid password", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          // Generic error message
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        // Fallback for network errors or unexpected issues
        toast.error("Login failed. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div style={styles.container} className="relative">
      <form onSubmit={handleLogin} style={styles.form}>
        <h1 style={styles.heading}>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>

      {/* Signup Button */}
      <div className="absolute top-5 right-10 w-[10%]">
        <button
          style={styles.button}
          onClick={() => {
            navigate("/signup");
          }}
        >
          SignUp
        </button>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#121212", // Dark background
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e", // Darker container for form
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.7)",
    width: "100%",
    maxWidth: "400px",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
    fontWeight: "bold",
    letterSpacing: "1px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px 20px",
    marginBottom: "15px",
    fontSize: "1rem",
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "5px",
    outline: "none",
  },
  button: {
    padding: "14px 0",
    fontSize: "1.1rem",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#ff5722",
    color: "#fff",
    width: "100%",
    transition: "all 0.3s ease-in-out",
  },
};

export default LoginPage;