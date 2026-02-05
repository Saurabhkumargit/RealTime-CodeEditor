const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// --------------------
// In-memory room store
// --------------------
const rooms = {};

// Utility: get or create room
function getOrCreateRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      document: "",
      users: {},
      createdAt: Date.now(),
      lastUpdatedAt: Date.now()
    };
  }
  return rooms[roomId];
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // --------------------
  // JOIN ROOM
  // --------------------
  socket.on("join-room", ({ roomId, userId }) => {
    const room = getOrCreateRoom(roomId);

    socket.join(roomId);

    // Register presence
    room.users[socket.id] = {
      userId,
      joinedAt: Date.now()
    };

    // Send authoritative snapshot to joining client
    socket.emit("room-state", {
      document: room.document,
      users: Object.values(room.users).map(u => u.userId)
    });

    // Notify others
    socket.to(roomId).emit("user-joined", { userId });

    console.log(`${userId} joined room ${roomId}`);
  });

  // --------------------
  // CODE CHANGE
  // --------------------
  socket.on("code-change", ({ roomId, document }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Last-write-wins
    room.document = document;
    room.lastUpdatedAt = Date.now();

    // Broadcast update
    socket.to(roomId).emit("code-update", { document });
  });

  // --------------------
  // DISCONNECT
  // --------------------
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const user = room.users[socket.id];

      if (user) {
        delete room.users[socket.id];

        socket.to(roomId).emit("user-left", {
          userId: user.userId
        });

        console.log(`${user.userId} left room ${roomId}`);

        // Optional cleanup
        if (Object.keys(room.users).length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
        }

        break;
      }
    }
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
