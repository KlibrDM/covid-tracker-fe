export async function getChartsPublic() {
  const res = await fetch('http://localhost:8001/charts/get-public');
  const data = await res.json();

  return data;
}
