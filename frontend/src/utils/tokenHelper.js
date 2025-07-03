export function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = token.split('.')[1];
  try {
    return JSON.parse(atob(payload)).role;
  } catch (e) {
    return null;
  }
}

export function decodeJWT() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}
