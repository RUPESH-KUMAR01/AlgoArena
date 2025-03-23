import { Server as SocketIOServer } from "socket.io";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ["http://localhost:5173", "https://algoarena-frotend.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const rooms = {}; // Stores room data (users & language)

  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    if (!username) {
      console.log("User ID not provided during connection");
      return;
    }

    console.log(`${username} connected`);

    // User joins a room
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      console.log(`${username} joined room ${roomId}`);

      // Initialize room if not exists
      if (!rooms[roomId]) {
        rooms[roomId] = { users: new Set(), language: "javascript" }; // Default JS
      }

      rooms[roomId].users.add(username);

      // Send the current language to the user
      socket.emit("room-language", rooms[roomId].language);

      // Broadcast updated user list
      io.to(roomId).emit("active-users", Array.from(rooms[roomId].users));
    });

    // Handle language change
    socket.on("set-language", ({ roomId, language }) => {
      if (rooms[roomId]) {
        rooms[roomId].language = language;
        io.to(roomId).emit("room-language", language); // Notify all users
      }
    });

    // Handle code updates
    socket.on("code-update", (data) => {
      socket.to(data.roomId).emit("update-code", data);
    });

    // User leaves the room
    socket.on("leave-room", ({ roomId }) => {
      console.log(`${username} left room ${roomId}`);

      if (rooms[roomId]) {
        rooms[roomId].users.delete(username);

        if (rooms[roomId].users.size === 0) {
          delete rooms[roomId]; // Cleanup empty room
        } else {
          io.to(roomId).emit("active-users", Array.from(rooms[roomId].users));
        }
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`${username} disconnected`);

      for (let roomId in rooms) {
        if (rooms[roomId].users.has(username)) {
          rooms[roomId].users.delete(username);

          if (rooms[roomId].users.size === 0) {
            delete rooms[roomId];
          } else {
            io.to(roomId).emit("active-users", Array.from(rooms[roomId].users));
          }
        }
      }
    });
  });
};

export default setupSocket;
