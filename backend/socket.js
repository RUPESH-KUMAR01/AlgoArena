import {Server as SocketIOServer} from "socket.io";

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
        const userId = socket.handshake.query.username; // Access the userId sent as a query parameter
        if (userId) {
            userSocketMap.set(userId, socket.id);
        } else {
            console.log("User ID not provided during connection");
        } 
        socket.on('code-update', (data) => {
            socket.broadcast.emit('update-code', data)
        })

    })
}



export default setupSocket;
