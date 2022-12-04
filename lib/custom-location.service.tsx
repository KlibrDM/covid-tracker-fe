import { ICustomLocation } from "../models/custom-location";

export async function getCustomLocationsPersonal(token: string) {
  const res = await fetch('http://localhost:8001/custom-locations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function getCustomLocationsPublic() {
  const res = await fetch('http://localhost:8001/custom-locations/get-public');
  const data = await res.json();

  return data;
}

export async function deleteCustomLocation(code: string, token: string) {
  const res = await fetch(`http://localhost:8001/custom-locations/${code}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  const data = await res.json();

  return data;
}

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
