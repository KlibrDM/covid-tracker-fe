export async function getCustomLocationsPersonal(token: string) {
  const res = await fetch('http://localhost:8001/custom-locations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}
