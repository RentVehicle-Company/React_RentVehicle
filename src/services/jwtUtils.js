// JWT utilities for secure token handling
// Decodes JWT payload without verification (client-side only - server still validates)

export const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
};

export const getTokenExpiry = (token) => {
  const payload = decodeJwt(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

export const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry;
};

export const getJwtRole = (token) => {
  const payload = decodeJwt(token);
  // Spring Boot typically uses 'role', 'authorities', or 'scope' claims
  return payload?.role || payload?.authorities?.[0] || payload?.scope?.split(' ')[0] || null;
};

export const getJwtUserId = (token) => {
  const payload = decodeJwt(token);
  return payload?.sub || payload?.userId || payload?.id || null;
};