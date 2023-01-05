import { IReport } from "../models/report";

export async function getReportsPersonal(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}reports/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();

  return data;
}

export async function getReportsPublic() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}reports/get-public`);
  const data = await res.json();

  return data;
}

export async function deleteReport(id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  const data = await res.json();

  return data;
}

export async function updateReport(payload: IReport, id: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}reports/${id}`, {
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

export async function saveReport(payload: IReport, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}reports`, {
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
