import { Server as SocketIOServer } from "socket.io";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: [
                "http://localhost:5173", // Allow local development
                "https://algoarena-frotend.onrender.com"
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.username; // Access the userId sent as a query parameter
        console.log(`Backend: User ${userId} connected`);

        // Join a room when a user connects
        socket.on("join-room", ({ roomId }) => {
            socket.join(roomId); // Join the room
            console.log(`Backend: User ${userId} joined room ${roomId}`);
        });

        // Broadcast code updates to other users in the same room
        socket.on("code-update", (data) => {
            console.log(`Backend: Received code update for room ${data.roomId}`);
            socket.to(data.roomId).emit("update-code", data.code); // Emit to everyone except sender
        });

        // Handle language updates
        socket.on("language-update", async ({ roomId, currentLanguage }) => {
            console.log("Backend: Received language-update event for room:", roomId, "with language:", currentLanguage);

            try {
                // Update the room's currentLanguage in the database
                const updatedRoom = await Room.findOneAndUpdate(
                    { roomId }, // Find the room by roomId
                    { currentLanguage }, // Update the currentLanguage field
                    { new: true } // Return the updated document
                );

                if (!updatedRoom) {
                    console.error("Backend: Room not found for roomId:", roomId);
                    return;
                }

                console.log("Backend: Updated room language in database:", updatedRoom);

                // Broadcast the language update to all users in the room
                io.to(roomId).emit("update-language", currentLanguage);
                console.log("Backend: Broadcasted language update to room:", roomId);
            } catch (error) {
                console.error("Backend: Error updating language:", error.message);
            }
        });

        socket.on("disconnect", () => {
        });
    });

    return io; 
};

export default setupSocket;
