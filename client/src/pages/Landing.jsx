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
    <div style={{ padding: "40px" }}>
      <h1>Real-Time Editor</h1>

      <button onClick={createRoom}>Create Room</button>

      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="Enter Room Code"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}

export default Landing;
