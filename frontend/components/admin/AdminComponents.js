"use client";

/**
 * Card Component - Reusable card for displaying data
 */
export function AdminCard({ title, value, icon: Icon, trend, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${trend > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {trend > 0 ? "+" : ""}
              {trend}% from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className="text-blue-600">
            <Icon size={32} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Badge Component - Status or role indicator
 */
export function AdminBadge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Button Component
 */
export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Modal Component
 */
export function AdminModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * Loading Spinner
 */
export function AdminLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

/**
 * Error Message
 */
export function AdminErrorMessage({ message, onClose }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <p className="text-red-800 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 text-xl"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Success Message
 */
export function AdminSuccessMessage({ message, onClose }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <p className="text-green-800 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-600 hover:text-green-800 text-xl"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Pagination Component
 */
export function AdminPagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Showing {(page - 1) * pageSize + 1} to{" "}
        {Math.min(page * pageSize, total)} of {total} results
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>
        <input
          type="number"
          value={page}
          onChange={(e) => {
            const newPage = parseInt(e.target.value);
            if (newPage >= 1 && newPage <= totalPages) {
              onPageChange(newPage);
            }
          }}
          className="w-12 px-2 py-2 border border-gray-300 rounded text-center"
        />
        <span className="px-3 py-2">/ {totalPages}</span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Input Component
 */
export function AdminInput({ label, error, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Textarea Component
 */
export function AdminTextarea({ label, error, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Select Component
 */
export function AdminSelect({
  label,
  options,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
