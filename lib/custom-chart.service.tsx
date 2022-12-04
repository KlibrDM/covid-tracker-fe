import { IChart } from "../models/custom-chart";

export async function getChartsPersonal(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}charts/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function getChartsPublic() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}charts/get-public`);
  const data = await res.json();

  return data;
}

export async function deleteChart(id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}charts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  const data = await res.json();

  return data;
}

export async function updateCustomChart(payload: IChart, id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}charts/${id}`, {
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

export async function saveCustomChart(payload: IChart, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}charts`, {
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
