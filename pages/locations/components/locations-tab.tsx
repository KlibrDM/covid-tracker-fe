import styles from '../../../styles/Locations.module.css'
import { ILocation } from '../../../models/location';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarContainer, GridToolbarContainerProps, GridToolbarExportContainer, GridCsvExportMenuItem, GridCsvExportOptions, GridExportMenuItemProps, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { ButtonProps } from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { IData } from '../../../models/data';
import { getData } from '../../../lib/get-data';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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
  const [rawData, setRawData] = useState<IData[]>();
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
        setRawData(data);

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
          columns.push({
            field: key,
            headerName: key,
            type: key === 'date' ? 'date' : 'number',
            width: key === 'date' ? 100 : key.length * 6.5 + 40
          });
        });

        //Add rows
        data.forEach((data: IData, index: number) => {
          const row: any = {id: index, date: moment(data.date).format('YYYY-MM-DD')};
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

  const exportBlob = (blob: Blob, filename: string) => {
    // Save the blob in a json file
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    });
  };

  const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
    const { hideMenu } = props;

    return (
      <MenuItem
        onClick={() => {
          const blob = new Blob([JSON.stringify(rawData, null, 2)], {
            type: 'text/json',
          });
          exportBlob(blob, 'data.json');

          // Hide the export menu after the export
          hideMenu?.();
        }}
      >
        Export JSON
      </MenuItem>
    );
  };

  const csvOptions: GridCsvExportOptions = { delimiter: ',' };

  const CustomExportButton = (props: ButtonProps) => (
    <GridToolbarExportContainer {...props}>
      <GridCsvExportMenuItem options={csvOptions} />
      <JsonExportMenuItem />
    </GridToolbarExportContainer>
  );

  const CustomToolbar = (props: GridToolbarContainerProps) => (
    <GridToolbarContainer {...props}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <CustomExportButton />
    </GridToolbarContainer>
  );

  return (
    <>
      <div className={styles.locations_tab_container}>
        {
          Array.from(displayLocations.keys()).map((continent, index) => (
            <div key={index}>
              <h3>{continent}</h3>
              <div className={styles.locations_group}>
              {
                displayLocations.get(continent)?.map((location, index) => (
                  <Card
                    key={location.code}
                    className={styles.locations_card}
                    onClick={() => handleDataDialogOpen(location)}
                  >
                    <CardContent className={styles.location_card_content}>
                      <h4>{location.name}</h4>
                      {location.population && <p>Population: {location.population}</p>}
                    </CardContent>
                  </Card>
                ))
              }
              </div>
            </div>
          ))
        }
      </div>

      <Dialog open={isDataDialogOpen} onClose={handleDataDialogClose} fullWidth maxWidth="lg">
        {selectedLocation &&
          <>
            <DialogTitle>Data for {selectedLocation.name}</DialogTitle>
            <DialogContent sx={{height: "80vh", paddingBottom: 0, display: 'flex', flexDirection: 'column', gap: '1em'}}>
            <div className={styles.details_table_container}>
                {isDataReady
                ? <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Population</TableCell>
                        <TableCell>Pop. Density</TableCell>
                        <TableCell>Median Age</TableCell>
                        <TableCell>Aged 65+</TableCell>
                        <TableCell>Hosp. Beds per 1K</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ border: 0 }}>
                        <TableCell>{selectedLocation.population || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.population_density || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.median_age || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.aged_65_older || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.hospital_beds_per_thousand || 'Unknown'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
                }
              </div>
              <div className={styles.table_container}>
                {isDataReady
                ? <DataGrid
                    rows={displayData.rows}
                    columns={displayData.columns}
                    rowHeight={35}
                    headerHeight={45}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    components={{ Toolbar: CustomToolbar }}
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
