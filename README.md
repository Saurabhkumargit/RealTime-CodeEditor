# SyncCode — Real-Time Collaborative Code Editor

> **🔗 Live Demo: [https://synccodex.vercel.app](https://synccodex.vercel.app)**

A real-time collaborative code editor built to explore WebSockets and live state synchronization. Multiple users can join the same room and edit a shared code buffer with instant updates.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Monaco Editor |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| State | In-memory |
| Sync Model | Last-write-wins |

---

## How It Works

1. Users join a room via a unique room code in the URL
2. The server maintains authoritative code state per room
3. On every edit:
   - Client updates local UI immediately
   - Client sends the full updated text to the server
   - Server overwrites room state and broadcasts to all peers in the room

---

## Design Decisions

- **Server as source of truth** — ensures consistent shared state across all clients
- **Full-text sync instead of diffs** — simpler, avoids conflict complexity
- **Last-write-wins** — acceptable for a minimal collaborative system
- **In-memory storage** — keeps focus on real-time behavior, not persistence

---

## Running Locally

```bash
# Backend
cd server
node index.js

# Frontend
cd client
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)