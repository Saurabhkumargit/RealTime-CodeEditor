const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { loadAllRooms, saveAllRooms } = require("./storage");

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SWEEP_INTERVAL = 60 * 1000; // 1 minute

// --------------------
// Restore persisted rooms
// --------------------
const persistedRooms = loadAllRooms();
const rooms = {};


for (const roomId in persistedRooms) {
  const data = persistedRooms[roomId];

  rooms[roomId] = {
    id: data.id || roomId,
    document: data.document || "",
    users: {}, // Presence is always runtime-only
    createdAt: data.createdAt || Date.now(),
    lastUpdatedAt: data.lastUpdatedAt || Date.now(),
    lastActivityAt: data.lastActivityAt || Date.now(),
  };
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// --------------------
// Helper: expiration check
// --------------------
function isRoomExpired(room) {
  return Date.now() - room.lastActivityAt > INACTIVITY_TIMEOUT;
}

// --------------------
// Socket Logic
// --------------------
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // --------------------
  // JOIN ROOM
  // --------------------
  socket.on("join-room", ({ roomId, userId }) => {
    const room = rooms[roomId];

    // Room must already exist (no auto-create in V3)
    if (!room) {
      socket.emit("room-error", { message: "Room not found" });
      return;
    }

    // Expiration check BEFORE allowing join
    if (isRoomExpired(room)) {
      delete rooms[roomId];
      saveAllRooms(rooms);

      socket.emit("room-error", { message: "Room expired" });
      return;
    }

    // Mark activity
    room.lastActivityAt = Date.now();

    socket.join(roomId);

    room.users[socket.id] = {
      userId,
      joinedAt: Date.now(),
    };

    socket.emit("room-state", {
      document: room.document,
      users: Object.values(room.users).map((u) => u.userId),
    });

    socket.to(roomId).emit("user-joined", { userId });
  });

  // --------------------
  // CODE CHANGE
  // --------------------
  socket.on("code-change", ({ roomId, document }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.document = document;
    room.lastUpdatedAt = Date.now();
    room.lastActivityAt = Date.now();

    saveAllRooms(rooms);

    socket.to(roomId).emit("code-update", { document });
  });

  // --------------------
  // DISCONNECT
  // --------------------
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.users[socket.id]) {
        const user = room.users[socket.id];
        delete room.users[socket.id];

        socket.to(roomId).emit("user-left", {
          userId: user.userId,
        });

        console.log(`${user.userId} left room ${roomId}`);
        break;
      }
    }
  });
});

// --------------------
// Periodic Sweep
// --------------------
function cleanupExpiredRooms() {
  const now = Date.now();

  for (const roomId in rooms) {
    const room = rooms[roomId];

    if (now - room.lastActivityAt > INACTIVITY_TIMEOUT) {
      console.log(`Room ${roomId} expired due to inactivity`);
      delete rooms[roomId];
    }
  }

  saveAllRooms(rooms);
}

setInterval(cleanupExpiredRooms, SWEEP_INTERVAL);

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
