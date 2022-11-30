import { IData } from "../models/data";

export async function addCustomLocationData(payload: IData, token: string) {
  const res = await fetch('http://localhost:8001/custom-locations/data', {
    method: 'POST',
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
