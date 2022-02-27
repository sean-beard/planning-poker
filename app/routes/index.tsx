import { useNavigate } from "remix";
import { v4 as uuid } from "uuid";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "2rem" }}>EP Planning Poker</h1>

      <p style={{ marginBottom: "2rem" }}>
        Distributed planning poker for estimating agile projects.
      </p>

      <button
        type="button"
        style={{ height: "40px", width: "150px", cursor: "pointer" }}
        onClick={() => {
          const UUID = uuid();

          navigate(`/rooms/${UUID}`);
        }}
      >
        Create new room
      </button>
    </div>
  );
}
