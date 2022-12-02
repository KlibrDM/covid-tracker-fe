import { ICustomLocation } from "../models/custom-location";

export async function updateCustomLocation(payload: ICustomLocation, token: string) {
  const res = await fetch(`http://localhost:8001/custom-locations/${payload.code}`, {
    method: 'PUT',
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
