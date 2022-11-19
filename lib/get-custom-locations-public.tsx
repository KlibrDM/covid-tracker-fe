export async function getCustomLocationsPublic() {
  const res = await fetch('http://localhost:8001/custom-locations/get-public');
  const data = await res.json();

  return data;
}
