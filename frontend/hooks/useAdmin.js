import { useContext, useState } from "react";
import { AdminContext } from "@/context/AdminContext";

/**
 * Hook to access admin context
 * Throws error if used outside AdminProvider
 */
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}

/**
 * Hook to check if admin has specific role
 */
export function useAdminRole(role) {
  const { hasRole } = useAdmin();
  return hasRole(role);
}

/**
 * Hook to check if admin has specific permission
 */
export function useAdminPermission(action) {
  const { hasPermission } = useAdmin();
  return hasPermission(action);
}

/**
 * Hook for pagination state management
 */
export function usePagination(initialPage = 1, defaultPageSize = 50) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    setPage,
    setPageSize,
  };
}

/**
 * Hook for filter state management
 */
export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    setFilters,
  };
}
