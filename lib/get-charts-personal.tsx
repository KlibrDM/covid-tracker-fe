export async function getChartsPersonal(token: string) {
  const res = await fetch('http://localhost:8001/charts/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();

  return data;
}
