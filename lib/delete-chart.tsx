export async function deleteChart(id: string, token: string) {
  const res = await fetch(`http://localhost:8001/charts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  const data = await res.json();

  return data;
}
