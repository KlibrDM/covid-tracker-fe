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
