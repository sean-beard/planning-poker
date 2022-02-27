import { useNavigate } from "remix";
import { v4 as uuid } from "uuid";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <h1>EP Planning Poker</h1>

      <p>Distributed planning poker for estimating agile projects.</p>

      <button
        type="button"
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
