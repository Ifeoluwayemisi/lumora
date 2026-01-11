export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lumoraToken");
}

export function logout() {
  localStorage.removeItem("lumoraToken");
  window.location.href = "/auth/login";
}
