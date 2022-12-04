import { IData } from "../models/data";

export async function addCustomLocationData(payload: IData, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/data`, {
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

export async function updateCustomLocationData(payload: IData, token: string, old_date: Date, location_code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/data?location_code=${location_code}&old_date=${old_date}`, {
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

export async function deleteCustomlocationData(token: string, location_code: string, dates: string[]) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/data-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({location_code, dates})
    });
  const data = await res.json();

  return data;
}
