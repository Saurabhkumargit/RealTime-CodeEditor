Real-Time Collaborative Code Editor (Minimal)
Overview

A minimal real-time collaborative code editor built to understand WebSockets and real-time state synchronization.
Multiple users can join the same room and edit a shared code buffer with live updates.

This project intentionally avoids advanced features to focus on core system behavior.

Tech Stack

Frontend: React (Vite), plain textarea

Backend: Node.js, Express

Real-time: Socket.io

State: In-memory

Sync Model: Last-write-wins

How It Works

Users join a room using a roomId passed via URL

The server maintains the authoritative code state per room

On every edit:

Client updates local UI immediately

Client sends the full updated text to the server

Server overwrites room state

Server broadcasts the update to other users in the room

Design Decisions

Server as source of truth: Ensures consistent shared state

Full-text sync instead of diffs: Simpler, avoids conflict complexity

Last-write-wins: Acceptable for a minimal collaborative system

In-memory storage: Keeps focus on real-time behavior, not persistence

Limitations (Intentional)

No authentication

No database

No conflict resolution (CRDT/OT)

No code execution

No UI polish

Running Locally
# Backend
cd server
node index.js

# Frontend
cd client
npm run dev


Open:

http://localhost:5173/?roomId=test