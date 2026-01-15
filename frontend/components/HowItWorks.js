const steps = [
  {
    title: "Scan or Input Code",
    description: "Scan the product QR or enter its code manually.",
  },
  {
    title: "Verify Instantly",
    description: "Lumora checks registration, AI risk score, and expiry.",
  },
  {
    title: "Get Risk Insights",
    description: "See if the product is genuine, suspicious, or expired.",
  },
  {
    title: "Report Issues",
    description: "Alert us or NAFDAC if you encounter a suspicious product.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how"
      className="py-20 bg-green-50 dark:bg-gray-800 px-4 text-center"
    >
      <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-white">
        How It Works
      </h2>
      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-genuine">
              {step.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
