import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate all fields are filled
    if (!username || !email || !password) {
      toast.error("All fields are required!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.post("/api/auth/signup", {
        username,
        email,
        password,
      });

      console.log("Signup response:", response.data); // Debugging

      // Successful signup
      if (response.data.username) {
        toast.success(`Welcome to AlgoArena, ${response.data.username}!`, {
          position: "top-right",
          autoClose: 3000,
        });

        // Save user details to localStorage
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("token", response.data.token);

        // Redirect to the next page
        navigate("/create-join");
      }
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "Signup failed. Please try again later.";

      if (error.response) {
        console.log("Error response:", error.response.data); // Debugging

        if (typeof error.response.data === "string") {
          errorMessage = error.response.data; // Handle string responses
        } else if (typeof error.response.data === "object") {
          errorMessage = error.response.data.message || errorMessage; // Handle object responses
        }

        // Handle specific error cases
        if (errorMessage.toLowerCase().includes("user already exists")) {
          toast.error("Username or email already taken!", {
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
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div style={styles.container} className="relative">
      <form onSubmit={handleSignup} style={styles.form}>
        <h1 style={styles.heading}>Signup</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
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
          Signup
        </button>
      </form>
      <div className="absolute right-10 top-5 w-[10%]">
        <button style={styles.button} onClick={() => navigate('/login')}>
          Login
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
    backgroundColor: "#121212",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
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

export default SignupPage;