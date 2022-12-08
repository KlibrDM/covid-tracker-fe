import { MenuItem, TextField } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { IData } from '../models/data';
import { ILocation } from '../models/location';
import styles from '../styles/Latest-Data.module.css'

const sortTypes = {
  NameAscending: 'Name ascending',
  NameDescending: 'Name descending',
  Value1Asc: '',
  Value1Desc: '',
  Value2Asc: '',
  Value2Desc: '',
}
type sortType = typeof sortTypes[keyof typeof sortTypes];

interface ILatestData {
  location_code: string;
  location_name: string;
  date: Date;
  value1: number;
  label1: string;
  value2: number;
  label2: string;
}

const LatestData = (props: any) => {
  const [searchValue, setSearchValue] = useState('');
  const [sort, setSort] = useState<sortType>(sortTypes.NameAscending);
  const [displayData, setDisplayData] = useState<IData[]>();

  const location = props.location as string;
  const locations = props.locations as ILocation[];
  const latestData = props.latestData as IData[];
  const key1 = props.key1 as string;
  const label1 = props.label1 as string;
  const key2 = props.key2 as string;
  const label2 = props.label2 as string;
  const changeLocation = props.changeLocation;

  //Add new sort types
  sortTypes.Value1Asc = label1 + ' ascending';
  sortTypes.Value1Desc = label1 + ' descending';
  sortTypes.Value2Asc = label2 + ' ascending';
  sortTypes.Value2Desc = label2 + ' descending';

  //Create a new array of data to display
  let data: ILatestData[] = latestData.map(e => ({
    location_code: e.location_code,
    location_name: locations.find(l => l.code === e.location_code)?.name ?? '',
    date: e.date,
    value1: e[key1 as keyof typeof e] as number,
    label1: label1,
    value2: e[key2 as keyof typeof e] as number,
    label2: label2,
  }));

  //Add current location as first element
  const currentLocationIndex = data.findIndex(e => e.location_code === location);
  if(currentLocationIndex !== -1){
    data.unshift(data[currentLocationIndex]);
    data.splice(currentLocationIndex + 1, 1);
  }

  //Set display data on page load
  useEffect(() => {
    setDisplayData(data);
  }, []);

  const handleSearchValueChange = (e: any) => {
    setSearchValue(e.target.value);
    //Use current search and already set sort value
    filterAndSort(e.target.value, sort);
  }

  const handleSortChange = (e: any) => {
    setSort(e.target.value);
    //Use already set search value and current sort
    filterAndSort(searchValue, e.target.value);
  }

  const filterAndSort = (searchVal: string, sortVal: string) => {
    if(searchVal){
      data = data.filter(e => e.location_name!.toLowerCase().includes(searchVal.toLowerCase()));
    }

    //Store the elements from data where value1 & value2 is not a number
    //Add them to the end of the list later
    const notANumberValue1 = data.filter(e => isNaN(e.value1));
    const notANumberValue2 = data.filter(e => isNaN(e.value2));
    
    if(sortVal === sortTypes.NameAscending){
      data = data.sort((a, b) => a.location_name!.localeCompare(b.location_name!));
    }
    else if(sortVal === sortTypes.NameDescending){
      data = data.sort((a, b) => b.location_name!.localeCompare(a.location_name!));
    }
    else if(sortVal === sortTypes.Value1Asc){
      data = removeNaN(data, 'value1')!;
      data = data.sort((a, b) => a.value1 - b.value1);
      data = addNaN(data, notANumberValue1);
    }
    else if(sortVal === sortTypes.Value1Desc){
      data = removeNaN(data, 'value1')!;
      data = data.sort((a, b) => b.value1 - a.value1);
      data = addNaN(data, notANumberValue1);
    }
    else if(sortVal === sortTypes.Value2Asc){
      data = removeNaN(data, 'value2')!;
      data = data.sort((a, b) => a.value2 - b.value2);
      data = addNaN(data, notANumberValue2);
    }
    else if(sortVal === sortTypes.Value2Desc){
      data = removeNaN(data, 'value2')!;
      data = data.sort((a, b) => b.value2 - a.value2);
      data = addNaN(data, notANumberValue2);
    }
    setDisplayData(data);
  }

  const removeNaN = (data: ILatestData[], key: 'value1' | 'value2') => {
    if(key === 'value1'){
      return data.filter(e => !isNaN(e.value1));
    }
    else if(key === 'value2'){
      return data.filter(e => !isNaN(e.value2));
    }
  }

  const addNaN = (data: ILatestData[], NaNValues: ILatestData[]) => {
    return data.concat(NaNValues);
  }
  
  return (
    <div className={styles.latest_data_container}>
      <div className={styles.latest_data_header}>
        <h1>Latest Data</h1>
        <div className={styles.latest_data_header_inputs}>
          <TextField
            type="text"
            name="search"
            id="search"
            label="Search"
            variant="outlined"
            value={searchValue}
            onChange={handleSearchValueChange}
            size="small"
            fullWidth
          />
          <TextField
            select
            type="text"
            name="select-sort"
            id="search-sort"
            label="Sort by"
            variant="outlined"
            value={sort}
            onChange={handleSortChange}
            size="small"
            fullWidth
          >
            {Object.keys(sortTypes).map((key, index) => (
              <MenuItem key={index} value={sortTypes[key as keyof typeof sortTypes]}>{sortTypes[key as keyof typeof sortTypes]}</MenuItem>
            ))}
          </TextField>
        </div>
      </div>
      
      <div className={styles.latest_data_list}>
        {displayData && displayData.map((e: any) => {
          return (
            <div 
              key={e.location_code} 
              className={styles.latest_data_item}
              onClick={() => changeLocation(e.location_code)}>
              <h4>{e.location_name}</h4>
              <div className={styles.latest_data_item_values}>
                <div className={styles.latest_data_item_total}>
                  <p>{e.label1}</p>
                  <p>{e.value1 ?? 'Not available'}</p>
                </div>
                <div className={styles.latest_data_item_new}>
                  <p>{e.label2}</p>
                  <p>{e.value2 ?? 'Not available'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LatestData
