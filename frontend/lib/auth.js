export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lumora_token");
}

export function logout() {
  localStorage.removeItem("lumora_token");
  localStorage.removeItem("lumora_user");
  window.location.href = "/auth/login";
}
