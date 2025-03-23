const { Server: SocketIOServer } = require("socket.io");

const setupSocket = (server) => {
    const io = new SocketIOServer(server,{
        cors: {
            origin: ["http://localhost:5173",  // Allow local development
                "https://algoarena-frotend.onrender.com"],
            methods: ["GET","POST"],    
            credentials: true,
        },
    });

    const userSocketMap = new Map;

    io.on('connection', socket => {
        const roomId= socket.handshake.query.roomId;
        const userId = socket.handshake.query.username; // Access the userId sent as a query parameter
        if (userId) {
            userSocketMap.set(userId, socket.id);
        } else {
            console.log("User ID not provided during connection");
        } 
        socket.on('code-update', (data) => {
            socket.broadcast.emit('update-code', data)
        })

        socket.on("send-message", ({roomId, username, message}) => {
            console.log(`📩 Server received message: ${message} from ${username} in room ${roomId}`);            
            if(roomId){
                socket.to(roomId).emit("receive-message", {username, message});
            }
            else{
                console.log(`⚠️ send-message event missing roomId from ${username}`);            }
        });

    })
}



module.exports = setupSocket;
