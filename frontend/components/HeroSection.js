export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 text-center px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
        Fight Counterfeit Products with Lumora
      </h1>
      <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
        Verify products instantly, stay safe, and help protect Nigeria’s market
        with AI-driven insights.
      </p>
      <a
        href="/verify"
        className="px-8 py-4 bg-genuine text-white rounded-md text-lg font-semibold hover:bg-green-600 transition"
      >
        Verify Now
      </a>
    </section>
  );
}
