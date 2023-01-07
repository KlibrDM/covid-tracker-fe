import { ISimulation, ISimulationQuery } from "../models/simulation";
import { MAX_RESULTS_LIMIT } from "./constants";

export async function runSimulation(payload: ISimulationQuery, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}simulation`, {
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

export async function getSimulationsPersonal(token: string, limit?: number) {
  const reqLimit = limit ? limit : MAX_RESULTS_LIMIT;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}simulation?limit=${reqLimit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function getSimulationsPublic(limit?: number) {
  const reqLimit = limit ? limit : MAX_RESULTS_LIMIT;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}simulation/get-public?limit=${reqLimit}`);
  const data = await res.json();

  return data;
}

export async function deleteSimulation(id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}simulation/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  const data = await res.json();

  return data;
}

export async function updateSimulation(payload: ISimulation, id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}simulation/${id}`, {
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

export async function saveSimulation(payload: ISimulation, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}simulation/save`, {
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
