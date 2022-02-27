export function PlayerEstimate({
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
