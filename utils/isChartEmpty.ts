export const isChartEmpty = (datasets: any[]) => {
  let foundAny = false;
  datasets.forEach(dataset => {
    if (dataset.data.length > 0) {
      foundAny = true;
    }
  });
  return !foundAny;
}
