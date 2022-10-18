export async function getData(country: string, projection?: string | string[], start_date?: string, end_date?: string) {
  let countryStr = 'location_code=' + country;
  let startDateStr = '';
  if(start_date){
    startDateStr = '&start_date=' + start_date;
  }
  let endDateStr = '';
  if(end_date){
    endDateStr = '&end_date=' + end_date;
  }
  let projectionStr = '';
  if(projection){
    if(Array.isArray(projection)){
      projection.forEach(e => {
        projectionStr += '&projection=' + e;
      });
    }
    else {
      projectionStr = '&projection=' + projection;
    }
  }

  const res = await fetch('http://localhost:8001/get-data?' + countryStr + startDateStr + endDateStr + projectionStr)
  const data = await res.json()

  return data
}
