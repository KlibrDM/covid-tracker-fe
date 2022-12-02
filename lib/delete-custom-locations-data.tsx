export async function deleteCustomlocationData(token: string, location_code: string, dates: string[]) {
  const res = await fetch(`http://localhost:8001/custom-locations/data-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({location_code, dates})
    });
  const data = await res.json();

  return data;
}
