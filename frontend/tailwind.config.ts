/**
 * Tailwind CSS Configuration
 *
 * Customizes Tailwind with application-specific colors and styles
 *
 * Color Scheme:
 * - genuine: Green color for verified/valid products (#28A745)
 * - codeUsed: Yellow for already-used codes (#FFC107)
 * - invalid: Red for invalid/fake products (#DC3545)
 * - unregistered: Light yellow for unregistered products (#FFEB3B)
 * - suspicious: Dark red for suspicious products (#8B0000)
 *
 * These colors are used for product verification status indicators
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Include JSX/JS files for Tailwind to scan
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Custom color palette for product verification statuses
      colors: {
        genuine: "#28A745", // ✓ Verified, legitimate product
        codeUsed: "#FFC107", // ⚠ Product code already scanned
        invalid: "#DC3545", // ✗ Invalid or counterfeit
        unregistered: "#FFEB3B", // ? Unregistered manufacturer
        suspicious: "#8B0000", // ⚠ High risk/suspicious
      },
      // Custom font families
      fontFamily: {
        heading: ["Inter", "sans-serif"], // For headings and titles
        body: ["Roboto", "sans-serif"], // For body text
      },
    },
  },
  plugins: [],
};
