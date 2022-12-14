export async function login(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });
  const data = await res.json();
  const status = res.status;

  return data ? data : status;
}

export async function register(email: string, password: string, location: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/register`, {
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
