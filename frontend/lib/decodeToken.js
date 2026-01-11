import jwtDecode from "jwt-decode";

export function decodeUser(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
