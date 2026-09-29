function getStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Too short", color: "bg-red-500", text: "text-red-600" },
    { label: "Weak", color: "bg-red-500", text: "text-red-600" },
    { label: "Fair", color: "bg-amber-500", text: "text-amber-600" },
    { label: "Good", color: "bg-yellow-500", text: "text-yellow-600" },
    { label: "Strong", color: "bg-green-500", text: "text-green-600" },
    { label: "Very strong", color: "bg-green-600", text: "text-green-700" },
  ];

  return { score, ...levels[score] };
}

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const { score, label, color, text } = getStrength(password);

  return (
    <div className="mt-2 animate-fade-in">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors ${n <= score ? color : "bg-surface-200"}`}
            />
          ))}
        </div>
        <span className={`text-2xs font-medium ${text}`}>{label}</span>
      </div>
    </div>
  );
}