import { useNavigate } from "remix";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <h1>EP Planning Poker</h1>

      <p>Distributed planning poker for estimating agile projects.</p>

      <button
        type="button"
        onClick={() => {
          const UUID = crypto.randomUUID();

          navigate(`/rooms/${UUID}`);
        }}
      >
        Create new room
      </button>
    </div>
  );
}
