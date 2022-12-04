export async function getData(country: string, projection?: string | string[], start_date?: string, end_date?: string, use_custom_locations?: boolean) {
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
  let useCustomLocationsStr = '';
  if(use_custom_locations){
    useCustomLocationsStr = '&use_custom_locations=true';
  }

  const res = await fetch('http://localhost:8001/get-data?' + countryStr + startDateStr + endDateStr + projectionStr + useCustomLocationsStr);
  const data = await res.json()

  return data
}

export async function getLatestData(country?: string | string[], projection?: string | string[]) {
  let countryStr = '';
  if(country){
    if(Array.isArray(country)){
      country.forEach(e => {
        countryStr += '&location_code=' + e;
      });
    }
    else {
      countryStr = '&location_code=' + country;
    }
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

  const res = await fetch('http://localhost:8001/get-latest-data?' + countryStr + projectionStr)
  const data = await res.json()

  return data
}
