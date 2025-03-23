import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import "../App.css";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { io } from "socket.io-client";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";
  const [code, setCode] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [runResult, setRunResult] = useState("");
  const [language, setLanguage] = useState("javascript");
  const socketRef = useRef(null);

  // Fetch initial code and current language for the room
  const fetchRoomDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract the currentLanguage field
      const { currentLanguage, iniCode } = response.data;
      if (!currentLanguage) {
        console.error("Frontend: currentLanguage is missing or undefined in the response");
        setLanguage("javascript"); // Fallback to default language
      } else {
        setLanguage(currentLanguage); // Set the language state
      }

      // Set the initial code
      setCode(iniCode || "// Start coding here!");
    } catch (error) {
      console.error("Frontend: Error fetching room details:", error.response?.data || error.message);
    }
  };

  // Join the room and set up Socket.IO listeners
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: { username },
      });
    }

    // Join the room
    if (socketRef.current && roomId) {
      socketRef.current.emit("join-room", { roomId });
    }

    // Listen for code updates
    socketRef.current.on("update-code", (data) => {
      if (data.roomId === roomId) {
        setCode(data.code);
      }
    });

    // Listen for language updates
    socketRef.current.on("update-language", (newLanguage) => {
      console.log(`Frontend: Received language update from backend: ${newLanguage}`);
      setLanguage(newLanguage || "javascript"); // Provide a fallback value
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  // Fetch room details on component mount
  useEffect(() => {
    fetchRoomDetails();
  }, []);

  // Notify when the language changes
  useEffect(() => {
    if (language) {
      toast.info(`Switched to ${language}!`);
    } else {
      console.error("Frontend: Language is undefined");
    }
  }, [language]);

  // Handle code changes
  const handleCodeChange = async (value) => {
    setCode(value); // Update the state with the new value
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/update-code/${roomId}`,
        { code: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Frontend: Error updating room code:", error.response?.data || error.message);
    }

    socketRef.current.emit("code-update", {
      roomId: roomId,
      code: value,
    });
  };

  // Handle language changes
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    console.log(`Frontend: Language changed from ${language} to ${newLanguage}`);
    setLanguage(newLanguage);

    // Emit the language update to the backend
    socketRef.current.emit("language-update", { roomId, currentLanguage: newLanguage });
  };

  // Run the code using Piston API
  const runCode = () => {
    console.log(`Frontend: Running code in ${language}`);
    fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        version: "*",
        files: [
          {
            name: `file.${language === "javascript" ? "js" : language}`,
            content: code,
          },
        ],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_cpu_time: 10000,
        run_cpu_time: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.run && data.run.output) {
          setRunResult(data.run.output);
        }
      })
      .catch((error) => {
        console.error("Error executing code:", error);
        setRunResult("Error executing code");
      });
  };

  // Clear the output
  const clearOutput = () => {
    setRunResult("");
  };

  // Get the appropriate language extension for CodeMirror
  const getLanguageExtension = (lang) => {
    switch (lang) {
      case "python":
        return python();
      case "cpp":
        return cpp();
      case "java":
        return java();
      default:
        return javascript();
    }
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Handle leaving the room
  const handleLeaveRoom = () => {
    navigate("/create-join");
  };

  // Toggle the user menu dropdown
  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
  };

  return (
    <div className="container">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="navbar">
        <div className="navLeft">
          <h1 className="title">Algo Arena</h1>
        </div>
        <div className="navCenter">
          <ul className="navLinks">
            <li className="navLink">Room: {roomId}</li>
          </ul>
        </div>
        <div className="navRight">
          <button onClick={handleLeaveRoom} className="leaveButton">
            Leave Room
          </button>
          <div className="userMenu">
            <div
              className="userIcon"
              onClick={toggleUserMenu}
              title="User Options"
            >
              👤 {username}
            </div>
            {userMenuOpen && (
              <div className="dropdownMenu">
                <div className="dropdownItem">Profile</div>
                <div className="dropdownItem" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="editorResultWrapper">
        <div className="editorContainer">
          <div className="editor-navbar">
            <span className="file-name">main.{language === "javascript" ? "js" : language}</span>
            <div className="language-selector">
              <label htmlFor="language-select" className="language-label">
                Select Language:
              </label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="language-dropdown"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <button className="runButton" onClick={runCode}>
              Run
            </button>
          </div>
          <CodeMirror
            height="80vh"
            value={code}
            onChange={(value) => handleCodeChange(value)}
            extensions={[getLanguageExtension(language)]}
            theme="dark"
          />
        </div>
        <div className="resultContainer">
          <div className="output-navbar">
            <span className="output-title">Output</span>
            <button className="btn clear" onClick={clearOutput}>
              Clear
            </button>
          </div>
          <pre className="output">{runResult}</pre>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
