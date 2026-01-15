export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 bg-white dark:bg-gray-900 px-4 text-center"
    >
      <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
        Contact Us
      </h2>
      <form className="max-w-xl mx-auto flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          className="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <textarea
          placeholder="Message"
          className="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        ></textarea>
        <button
          type="submit"
          className="px-6 py-3 bg-genuine text-white rounded-md hover:bg-green-600 transition"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}
