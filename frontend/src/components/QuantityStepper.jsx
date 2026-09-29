export default function QuantityStepper({ value, min = 1, max = 99, onChange, size = "md" }) {
  const dims = size === "sm"
    ? { btn: "w-7 h-7", text: "w-8 text-sm", icon: "w-3.5 h-3.5", pad: "p-1" }
    : { btn: "w-8 h-8", text: "w-10 text-sm", icon: "w-4 h-4", pad: "p-1" };

  return (
    <div className={`flex items-center gap-1.5 bg-surface-100 rounded-xl ${dims.pad}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${dims.btn} rounded-lg bg-white text-surface-600 hover:bg-surface-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors`}
        aria-label="Decrease quantity"
      >
        <svg className={dims.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M5 12h14" />
        </svg>
      </button>
      <span className={`${dims.text} text-center font-medium text-surface-700`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${dims.btn} rounded-lg bg-white text-surface-600 hover:bg-surface-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors`}
        aria-label="Increase quantity"
      >
        <svg className={dims.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}