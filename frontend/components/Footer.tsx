// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold mb-4">Lumora</h4>
          <p className="text-gray-500 text-sm">
            Fighting counterfeits with intelligence across Nigeria.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Product</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            <li>Verify Code</li>
            <li>For Manufacturers</li>
            <li>API Docs</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            <li>About Us</li>
            <li>Contact</li>
            <li>Social Impact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms&condition">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-gray-600 text-xs mt-12">
        © 2025 Lumora. Built for the Future of Nigeria.
      </div>
    </footer>
  );
}