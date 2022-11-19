import { ICustomLocation } from "../models/custom-location";

export async function saveCustomLocation(payload: ICustomLocation, token: string) {
  const res = await fetch('http://localhost:8001/custom-locations', {
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
