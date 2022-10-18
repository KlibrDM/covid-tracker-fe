export async function loadLocations() {
  const res = await fetch('http://localhost:8001/locations')
  const data = await res.json()

  return data
}
