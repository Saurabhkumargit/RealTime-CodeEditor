const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const rooms = {};

io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("join-room", ({roomId}) =>{
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = { code: "" };
        }

        socket.emit("code-update", {
            code: rooms[roomId].code,
        })
    })

    socket.on("code-update", ({roomId, code}) => {
     if (!rooms[roomId]) return;

     rooms[roomId].code = code;

     socket.to(roomId).emit("code-update", {
        code,
     })   
    })

    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("Server is running on port 3001");
});
