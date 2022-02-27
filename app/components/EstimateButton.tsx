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
