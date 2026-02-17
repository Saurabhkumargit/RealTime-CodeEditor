import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Landing() {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");

  const createRoom = async () => {
    const res = await fetch("http://localhost:3001/rooms", {
      method: "POST",
    });

    const data = await res.json();
    navigate(`/room/${data.roomCode}`);
  };

  const joinRoom = () => {
    if (!roomInput) return;
    navigate(`/room/${roomInput}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">
        Real-Time Code Editor
      </h1>

      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <button
          onClick={createRoom}
          className="w-full bg-indigo-600 hover:bg-indigo-500 transition rounded-lg py-3 font-medium mb-6"
        >
          Create Room
        </button>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Room Code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
          />
          <button
            onClick={joinRoom}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg px-4"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
