import styles from '../../../styles/Locations.module.css'
import { ILocation } from '../../../models/location';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IData } from '../../../models/data';
import { getData } from '../../../lib/get-data';
import moment from 'moment';

const LocationsTab = (props: any) => {
  const location = props.location as string;
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const continents: Set<string> = new Set();
  const displayLocations: Map<string, ILocation[]> = new Map();

  // Search for continents and add them
  locations.forEach(e => continents.add(e.continent ? e.continent : "Other"));
  // Sort continents
  const continentSortingOrder = ["Europe", "North America", "South America", "Asia", "Africa", "Oceania", "Other"];
  const sortedContinents = Array.from(continents).sort((a, b) => continentSortingOrder.indexOf(a) - continentSortingOrder.indexOf(b));
  // Add locations to continents
  sortedContinents.forEach(e => displayLocations.set(e, locations.filter(l => l.continent === e || (!l.continent && e === "Other"))));
  // Sort countries in each continent
  displayLocations.forEach((value, key) => displayLocations.set(key, value.sort((a, b) => a.name.localeCompare(b.name))));

  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ILocation>();
  const [displayData, setDisplayData] = useState<{columns: GridColDef[], rows: any[]}>({columns: [], rows: []});
  const [isDataReady, setIsDataReady] = useState(false);

  const handleDataDialogClose = () => {
    setIsDataDialogOpen(false);
  };

  const handleDataDialogOpen = (location: ILocation) => {
    setIsDataReady(false);
    setSelectedLocation(location);
    setIsDataDialogOpen(true);
  };

  //When user clicks on a new location get data
  useEffect(() => {
    if(selectedLocation) {
      getData(selectedLocation.code).then((data: IData[]) => {
        //Empty data if there is nothing and return
        if(!data.length){
          setDisplayData({columns: [], rows: []});
          setIsDataReady(true);
          return;
        }

        const columns: GridColDef[] = [];
        const rows: any[] = [];

        //Add columns
        extractKeysFromData(data).forEach((key: string) => {
          columns.push({field: key, headerName: key, width: key === 'date' ? 200 : key.length * 6.5 + 40});
        });

        //Add rows
        data.forEach((data: IData, index: number) => {
          const row: any = {id: index, date: moment(data.date).format('YYYY-MM-DD, dddd')};
          Object.keys(data).forEach((key: string) => {
            if(key !== "date" && key !== "__v" && key !== "_id" && key !== "location_code") {
              row[key] = data[key as keyof IData];
            }
          });
          rows.push(row);
        });

        setDisplayData({columns, rows});
        setIsDataReady(true);
      });
    }
  }, [selectedLocation]);

  const extractKeysFromData = (data: IData[]) => {
    const keys: Set<string> = new Set();
    data.forEach(e => {
      Object.keys(e).forEach(k => {
        if(k !== "__v" && k !== "_id" && k !== "location_code") {
          keys.add(k);
        }
      });
    });
    return keys;
  }

  return (
    <>
      <div className={styles.locations_tab_container}>
        {
          Array.from(displayLocations.keys()).map((continent, index) => (
            <>
              <h3 key={index}>{continent}</h3>
              <div className={styles.locations_group}>
              {
                displayLocations.get(continent)?.map((location, index) => (
                  <Card
                    key={index}
                    className={styles.locations_card}
                    onClick={() => handleDataDialogOpen(location)}
                  >
                    <CardContent>
                      <h4>{location.name}</h4>
                      {location.population && <p>Population: {location.population}</p>}
                    </CardContent>
                  </Card>
                ))
              }
              </div>
            </>
          ))
        }
      </div>

      <Dialog open={isDataDialogOpen} onClose={handleDataDialogClose} fullWidth maxWidth="lg">
        {selectedLocation &&
          <>
            <DialogTitle>Data for {selectedLocation.name}</DialogTitle>
            <DialogContent sx={{height: "80vh", paddingBottom: 0}}>
              <div className={styles.table_container}>
                {isDataReady
                ? <DataGrid
                    rows={displayData.rows}
                    columns={displayData.columns}
                  />
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
                }
              </div>
            </DialogContent>
          </>
        }
        <DialogActions>
          <Button onClick={handleDataDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LocationsTab
