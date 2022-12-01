import { IData } from "../models/data";

export async function updateCustomLocationData(payload: IData, token: string, old_date: Date, location_code: string) {
  const res = await fetch(`http://localhost:8001/custom-locations/data?location_code=${location_code}&old_date=${old_date}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  const status = res.status;

  return data ? data : status;
}
