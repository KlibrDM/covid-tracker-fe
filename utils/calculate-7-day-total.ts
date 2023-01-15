export const sevenDayTotal = (data: any) => {
  const sevenDayTotal = [];
  for (let i = 0; i < data.length; i++) {
    const x1 = data.length - (i + 7) <= 0 ? data.length - 7 : i;
    const x2 = data.length - (i + 7) <= 0 ? data.length : i + 7;
    const dist = x2 - x1;
    const sum = dist !== 0 ? data.slice(x1, x2).reduce((a: number, b: number) => a + b, 0) : data[x1];
    sevenDayTotal.push(Math.round(sum));
  }
  return sevenDayTotal;
};
