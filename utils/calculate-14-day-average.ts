export const fourteenDayAverage = (data: any) => {
  const fourteenDayAverage = [];
  for (let i = 0; i < data.length; i++) {
    const x1 = i - 13 < 0 ? 0 : i - 13;
    const x2 = i + 1;
    const dist = x2 - x1;
    const sum = dist !== 0 ? data.slice(x1, x2).reduce((a: number, b: number) => a + b, 0) : data[x1];
    const avg = dist !== 0 ? sum / dist : sum;
    fourteenDayAverage.push(Math.round(avg));
  }
  return fourteenDayAverage;
};

export const isChartEmpty = (datasets: any[]) => {
  let foundAny = false;
  datasets.forEach(dataset => {
    if (dataset.data.length > 0) {
      foundAny = true;
    }
  });
  return !foundAny;
}
