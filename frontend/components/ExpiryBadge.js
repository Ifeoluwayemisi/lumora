export default function ExpiryBadge({ expiryDate }) {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  let text = `Valid until ${expiry.toLocaleDateString()}`;
  let color = "text-green-600 dark:text-green-400";

  if (diffDays <= 30 && diffDays > 0)
    color = "text-yellow-500 dark:text-yellow-400";
  if (diffDays <= 0) {
    color = "text-red-600 dark:text-red-400";
    text = `Expired on ${expiry.toLocaleDateString()}`;
  }

  return <p className={`font-semibold mt-2 ${color}`}>{text}</p>;
}
