export async function deleteCustomLocation(code: string, token: string) {
  const res = await fetch(`http://localhost:8001/custom-locations/${code}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  const data = await res.json();

  return data;
}
