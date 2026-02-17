import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Editor from "./pages/Editor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/room/:roomCode" element={<Editor />} />
    </Routes>
  );
}

export default App;
