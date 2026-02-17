import { useParams } from "react-router-dom";

function Editor() {
  const { roomCode } = useParams();

  return (
    <div>
      <h1>Editor Room: {roomCode}</h1>
      {/* Add your editor component here later */}
    </div>
  );
}

export default Editor;
