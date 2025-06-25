import jwtDecode from 'jwt-decode';

export function redirectBasedOnRole(token) {
  const { role } = jwtDecode(token);
  switch (role) {
    case 'admin': return '/admin-dashboard';
    case 'employee': return '/employee-dashboard';
    case 'owner': return '/owner-dashboard';
    default: return '/';
  }
}