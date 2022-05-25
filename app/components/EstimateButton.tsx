export function EstimateButton({
  disabled,
  estimate,
  onClick,
}: {
  disabled: boolean;
  estimate: number;
  onClick: (estimate: number) => void;
}) {
  return (
    <button
      {...{ disabled }}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        height: "40px",
        width: "50px",
        marginRight: ".75rem",
        marginBottom: "0.5rem",
      }}
      type="button"
      onClick={() => {
        onClick(estimate);
      }}
    >
      {estimate}
    </button>
  );
}
