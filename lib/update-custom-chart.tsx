import { IChart } from "../models/custom-charts";

export async function updateCustomChart(payload: IChart, id: string, token: string) {
  const res = await fetch(`http://localhost:8001/charts/${id}`, {
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
