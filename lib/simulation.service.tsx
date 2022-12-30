import { ISimulationQuery } from "../models/simulation";

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
