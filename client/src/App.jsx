import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [code, setCode] = useState("");

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("roomId");

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join-room", { roomId });

    socket.on("code-update", ({ code }) => {
      setCode(code);
    });

    return () => {
      socket.off("code-update");
    };
  }, [roomId]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    socket.emit("code-update", { roomId, code: newCode });
  };

  if (!roomId) {
    return <div>Room ID not found</div>;
  }

  return (
    <textarea
      value={code}
      onChange={handleChange}
      style={{
        width: "100%",
        height: "100vh",
        fontSize: "16px",
        padding: "20px",
      }}
    />
  );
}

export default App;
