export async function loadLocations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}locations`);
  const data = await res.json();

  return data;
}
