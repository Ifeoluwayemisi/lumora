export default function AIInsights({ insights }) {
  if (!insights) return null;
  return (
    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-left text-sm text-gray-700 dark:text-gray-300">
      <h3 className="font-semibold mb-1">AI Insights:</h3>
      <ul className="list-disc list-inside">
        {insights.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
