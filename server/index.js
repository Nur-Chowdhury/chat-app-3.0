const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");

const socket = require("socket.io");


const app = express();
require("dotenv").config();

const corsOptions = {
    origin: ["https://chat-app-3-0-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database Connected Successfully!");
}).catch((err) => {
    console.log(err.message);
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
});

const io = socket(server, {
    // cors: {
    //     origin: "http://localhost:3000",
    //     credentials: true,
    // }
    cors: {
        origin: ["https://chat-app-3-0-frontend.vercel.app/"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    }
})

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieved", data.messages);
        }
    });
});

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);