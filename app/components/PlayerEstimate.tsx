export function PlayerEstimate({
  isHidden,
  estimate,
  style = {},
}: {
  isHidden: boolean;
  estimate: number | null;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid rgb(8, 126, 168)",
        height: "40px",
        width: "50px",
        borderRadius: "5px",
        ...style,
      }}
    >
      {estimate && isHidden && <span>X</span>}
      {estimate && !isHidden && <span>{estimate}</span>}
    </div>
  );
}
