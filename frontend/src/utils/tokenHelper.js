export function getUserRole() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;

  const payload = token.split('.')[1];
  try {
    return JSON.parse(atob(payload)).role;
  } catch (e) {
    return null;
  }
}

export function decodeJWT() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}
