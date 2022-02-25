import { useState } from "react";
import { LoaderFunction, useLoaderData } from "remix";

export const loader: LoaderFunction = async ({ params }) => {
  return { roomId: params.roomId };
};

function EstimateButton({
  estimate,
  onClick,
}: {
  estimate: number;
  onClick: (estimate: number) => void;
}) {
  return (
    <button
      style={{ cursor: "pointer", height: "40px", width: "50px" }}
      type="button"
      onClick={() => {
        onClick(estimate);
      }}
    >
      {estimate}
    </button>
  );
}

function PlayerEstimate({
  isHidden,
  estimate,
}: {
  isHidden: boolean;
  estimate: number | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid black",
        height: "40px",
        width: "50px",
        borderRadius: "5px",
      }}
    >
      {estimate && isHidden && <span>X</span>}
      {estimate && !isHidden && <span>{estimate}</span>}
    </div>
  );
}

const ESTIMATE_OPTIONS = [1, 2, 3, 5, 8];

export default function Room() {
  const { roomId } = useLoaderData();
  const [estimate, setEstimate] = useState<number | null>(null);
  const [isHidden, setIsHidden] = useState(true);

  return (
    <div>
      <p>{roomId}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "300px",
          marginBottom: "2rem",
        }}
      >
        {ESTIMATE_OPTIONS.map((estimate) => (
          <EstimateButton estimate={estimate} onClick={setEstimate} />
        ))}
      </div>

      <p style={{ marginBottom: "1rem" }}>
        {estimate
          ? `Your current estimate is ${estimate}`
          : "You haven't estimated yet"}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {/* TODO: map over all players */}
        <PlayerEstimate {...{ estimate, isHidden }} />
      </div>

      <div
        style={{
          display: "flex",
          marginBottom: "2rem",
        }}
      >
        <button
          style={{ height: "40px", width: "75px", cursor: "pointer" }}
          onClick={() => setEstimate(null)}
        >
          Reset
        </button>
        <button
          style={{
            height: "40px",
            width: "75px",
            cursor: "pointer",
            marginLeft: "1rem",
          }}
          onClick={() => setIsHidden(false)}
        >
          Reveal
        </button>
      </div>
    </div>
  );
}
