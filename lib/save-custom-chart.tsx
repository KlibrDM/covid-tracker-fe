import { IChart } from "../models/custom-charts";

export async function saveCustomChart(payload: IChart, token: string) {
  const res = await fetch('http://localhost:8001/charts', {
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
