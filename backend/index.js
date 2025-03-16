const express=require('express')

const FullRoute=require('./routes/index')
const cors=require('cors');
const { default: setupSocket } = require('./socket');

const app=express()

app.use(cors({
    origin: "http://localhost:5173",  // Change this to your frontend's actual URL
    credentials: true, 
    allowedHeaders: ["Authorization", "Content-Type"]
  }));
  
app.use(express.json())

app.use("/api",FullRoute)

const server = app.listen(3000,()=>{
    console.log("Server is running on port 3000")
    console.log("Up and running")
});

setupSocket(server);

