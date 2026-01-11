export default function RiskScoreBadge({ score }) {
  if (score == null) return null;

  let color = "text-green-600 dark:text-green-400";
  if (score >= 0.5 && score < 0.8)
    color = "text-yellow-500 dark:text-yellow-400";
  if (score >= 0.8) color = "text-red-600 dark:text-red-400";

  return (
    <p className={`mt-2 font-semibold ${color}`}>
      Risk Score: {(score * 100).toFixed(0)}%
    </p>
  );
}
