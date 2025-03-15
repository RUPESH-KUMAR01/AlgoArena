import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../api/roomService";
import "../App.css";
import { ToastContainer, toast } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import default styles for toast notifications

const CreateJoinPage = () => {
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [previousRooms, setPreviousRooms] = useState([]);
  const username = localStorage.getItem("username") || "Guest";

  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem("previousRooms")) || [];
    setPreviousRooms(storedRooms);
  }, []);

  const handleCreateRoom = async () => {
    try {
      const response = await createRoom();
      const { roomId } = response.data;
      const updatedRooms = [roomId, ...previousRooms];
      localStorage.setItem("previousRooms", JSON.stringify(updatedRooms));
      setPreviousRooms(updatedRooms);
      navigate(`/room/${roomId}`);
      toast.success("New room created successfully!"); // Success toast
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create the room. Please try again."); // Error toast
    }
  };

  const handleJoinRoom = async () => {
    try {
      await joinRoom(roomIdInput);
      if (!previousRooms.includes(roomIdInput)) {
        const updatedRooms = [roomIdInput, ...previousRooms];
        localStorage.setItem("previousRooms", JSON.stringify(updatedRooms));
        setPreviousRooms(updatedRooms);
      }
      navigate(`/room/${roomIdInput}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Room not found. Please check the room ID."); // Error toast
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      {/* Toast Container for Notifications */}
      <ToastContainer
        position="top-right" // Position of the toast notifications
        autoClose={3000} // Auto close after 3 seconds
        hideProgressBar={false} // Show progress bar
        newestOnTop={true} // Newest notifications on top
        closeOnClick // Close on click
        rtl={false} // Right-to-left layout
        pauseOnFocusLoss // Pause when window loses focus
        draggable // Allow dragging
        pauseOnHover // Pause on hover
      />

      <div className="navbar">
        <div className="navLeft">
          <h1 className="title">Algo Arena</h1>
        </div>
        <div className="navCenter">
          <ul className="navLinks">
            <li className="navLink">Home</li>
            <li className="navLink">About</li>
            <li className="navLink">Contact</li>
          </ul>
        </div>
        <div className="navRight">
          <div className="userMenu">
            <div className="userIcon" title="User Options">
              👤 {username}
            </div>
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mainContent">
        <div className="leftSection">
          <div className="formContainer">
            <h2 className="sectionTitle">Create or Join a Room</h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              className="input"
            />
            <button onClick={handleJoinRoom} className="button">
              Join Room
            </button>
            <button onClick={handleCreateRoom} className="button">
              Create New Room
            </button>
          </div>
        </div>

        <div className="rightSection">
          <h2 className="sectionTitle">Previously Joined Rooms</h2>
          {previousRooms.length > 0 ? (
            <ul className="roomList">
              {previousRooms.map((roomId, index) => (
                <li
                  key={index}
                  className="roomListItem"
                  onClick={() => navigate(`/room/${roomId}`)}
                >
                  {roomId}
                </li>
              ))}
            </ul>
          ) : (
            <p className="noRoomsText">No previously joined rooms.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJoinPage;