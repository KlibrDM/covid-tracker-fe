import { ICustomLocation } from "../models/custom-location";
import { MAX_RESULTS_LIMIT } from "./constants";

export async function getCustomLocationsPersonal(token: string, limit?: number) {
  const reqLimit = limit ? limit : MAX_RESULTS_LIMIT;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations?limit=${reqLimit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function getCustomLocationsPublic(limit?: number) {
  const reqLimit = limit ? limit : MAX_RESULTS_LIMIT;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/get-public?limit=${reqLimit}`);
  const data = await res.json();

  return data;
}

export async function getCustomLocation(code: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/${code}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function getCustomLocationById(id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/get-by-id/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function deleteCustomLocation(code: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/${code}`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations/${payload.code}`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}custom-locations`, {
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
