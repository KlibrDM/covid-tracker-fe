export async function register(email: string, password: string, location: string) {
  const res = await fetch('http://localhost:8001/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password,
      location_code: location
    })
  });
  const data = await res.json();
  const status = res.status;

  return data ? data : status;
}
