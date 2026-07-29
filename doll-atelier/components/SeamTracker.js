const STAGES = [
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function SeamTracker({ status }) {
  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="seam-track">
      {STAGES.map((stage, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div className="seam-step" key={stage.key}>
            <div className={`seam-line ${isDone || isCurrent ? "done" : ""}`} />
            <div className={`seam-knot ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`} />
            <div className={`seam-step-label ${isDone || isCurrent ? "active" : ""}`}>
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
