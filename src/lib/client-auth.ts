export async function fetchCsrfToken(): Promise<string> {
  const res = await fetch('/api/auth/csrf', { cache: 'no-store' });
  const data = await res.json();
  return data.csrfToken || '';
}

export async function logoutUser(): Promise<void> {
  const csrfToken = await fetchCsrfToken();
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken },
  });
}
