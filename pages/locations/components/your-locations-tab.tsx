import styles from '../../../styles/Locations.module.css'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Alert, FormControlLabel, FormGroup, Switch, Snackbar, DialogContentText } from '@mui/material';
import { DataGrid, GridColDef, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarContainer, GridToolbarContainerProps, GridToolbarExportContainer, GridCsvExportMenuItem, GridCsvExportOptions, GridExportMenuItemProps, GridToolbarDensitySelector, GridRowModel, GridSelectionModel } from '@mui/x-data-grid';
import { ButtonProps } from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { IData, INDICATOR_LABELS } from '../../../models/data';
import { getData } from '../../../lib/data.service';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import moment from 'moment';
import { ICustomLocation } from '../../../models/custom-location';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import PublishIcon from '@mui/icons-material/Publish';
import YourLocationsAddData from './your-locations-add-data';
import { deleteCustomLocation, getCustomLocationsPersonal, saveCustomLocation, updateCustomLocation } from '../../../lib/custom-location.service';
import { deleteCustomlocationData, updateCustomLocationData } from '../../../lib/custom-location-data.service';
import { MAX_RESULTS_LIMIT, RESULTS_LIMIT } from '../../../lib/constants';

const YourLocationsTab = (props: any) => {
  const user = props.user || {};
  const [locations, setLocations] = useState<ICustomLocation[]>([]);
  const [locationsLoaded, setLocationsLoaded] = useState(false);

  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ICustomLocation>();
  const [rawData, setRawData] = useState<IData[]>();
  const [displayData, setDisplayData] = useState<{columns: GridColDef[], rows: any[]}>({columns: [], rows: []});
  const [isDataReady, setIsDataReady] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);

  //Form state
  const [newCode, setNewCode] = useState<string>();
  const [newName, setNewName] = useState<string>();
  const [newPopulation, setNewPopulation] = useState<number>();
  const [newPopulationDensity, setNewPopulationDensity] = useState<number>();
  const [newMedianAge, setNewMedianAge] = useState<number>();
  const [newAged65Older, setNewAged65Older] = useState<number>();
  const [newHospitalBedsPerThousand, setNewHospitalBedsPerThousand] = useState<number>();
  const [newGDPPerCapita, setNewGDPPerCapita] = useState<number>();
  const [newLifeExpectancy, setNewLifeExpectancy] = useState<number>();
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  //Edit data state
  const [editName, setEditName] = useState<string>();
  const [editPopulation, setEditPopulation] = useState<number>();
  const [editPopulationDensity, setEditPopulationDensity] = useState<number>();
  const [editMedianAge, setEditMedianAge] = useState<number>();
  const [editAged65Older, setEditAged65Older] = useState<number>();
  const [editHospitalBedsPerThousand, setEditHospitalBedsPerThousand] = useState<number>();
  const [editGDPPerCapita, setEditGDPPerCapita] = useState<number>();
  const [editLifeExpectancy, setEditLifeExpectancy] = useState<number>();
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [isEditSaved, setIsEditSaved] = useState<boolean>(true);

  //Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");

  const handleDataDialogClose = () => {
    setIsDataDialogOpen(false);
  };

  const handleDataDialogOpen = (location: ICustomLocation) => {
    setSelectedLocation(location);
    getTableData();
    setIsDataDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
  };

  const handleEditDialogOpen = (location: ICustomLocation) => {
    setSelectedLocation(location);
    setIsEditDialogOpen(true);
  };

  const refreshData = () => {
    getTableData();
  };

  const handleRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
    try {
      const response = await updateCustomLocationData((newRow as IData), user.token, oldRow.date, selectedLocation!.code);
      return {...response, id: response.date};
    }
    catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Couldn\'t update data');
      setSnackbarOpen(true);
    }
  };

  const deleteSelectedData = async () => {
    try {
      const response = await deleteCustomlocationData(user.token, selectedLocation!.code, selectionModel as string[]);
      if(!response.message){
        setSnackbarSeverity('warning');
        setSnackbarMessage('Data successfully deleted');
        setSnackbarOpen(true);

        //Update rows
        const newRows = displayData.rows.filter(e => !selectionModel.includes(e.id));
        setDisplayData({...displayData, rows: newRows});
      }
    }
    catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Couldn\'t delete data');
      setSnackbarOpen(true);
    }
  };

  const handleRowUpdateError = async (error: Error) => {
    setSnackbarSeverity('error');
    setSnackbarMessage('Couldn\'t update data.');
    setSnackbarOpen(true);
  };

  const handleDelete = async (location: ICustomLocation) => {
    const newLocations = locations.filter(l => l.code !== location.code);
    setLocations(newLocations);
    try {
      const response = await deleteCustomLocation(location.code, user.token);

      if(response.message === "Location deleted"){
        setSnackbarSeverity('warning');
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
      }
      else{
        setSnackbarSeverity('error');
        setSnackbarMessage('Error deleting location. Error Code: ' + response.status);
        setSnackbarOpen(true);
      }
    }
    catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error deleting location');
      setSnackbarOpen(true);
    }
  }

  const handleSave = async () => {
    const payload: ICustomLocation = {
      ownerId: user._id,
      is_public: newIsPublic,
      code: newCode || '',
      name: newName || '',
      population: newPopulation,
      population_density: newPopulationDensity,
      median_age: newMedianAge,
      aged_65_older: newAged65Older,
      hospital_beds_per_thousand: newHospitalBedsPerThousand,
      gdp_per_capita: newGDPPerCapita,
      life_expectancy: newLifeExpectancy
    };

    try {
      const response = await saveCustomLocation(payload, user.token);
      if(typeof response === 'number'){
        setSnackbarSeverity('error');
        setSnackbarMessage('Error encountered! Code: ' + response);
        setSnackbarOpen(true);
      }
      else if(response.message){
        setSnackbarSeverity('error');
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
      }
      else{
        setIsSaved(true);

        //Snackbar
        setSnackbarSeverity('success');
        setSnackbarMessage('Location saved successfully');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error saving location');
      setSnackbarOpen(true);
    }
  };

  const handleDetailsEdit = async () => {
    const payload: ICustomLocation = {
      ownerId: user._id,
      is_public: editIsPublic,
      code: selectedLocation!.code || '',
      name: editName || '',
      population: editPopulation,
      population_density: editPopulationDensity,
      median_age: editMedianAge,
      aged_65_older: editAged65Older,
      hospital_beds_per_thousand: editHospitalBedsPerThousand,
      gdp_per_capita: editGDPPerCapita,
      life_expectancy: editLifeExpectancy
    };

    try {
      const response = await updateCustomLocation(payload, user.token);
      if(typeof response === 'number'){
        setSnackbarSeverity('error');
        setSnackbarMessage('Error encountered! Code: ' + response);
        setSnackbarOpen(true);
      }
      else if(response.message){
        setSnackbarSeverity('error');
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
      }
      else{
        setIsEditSaved(true);

        //Snackbar
        setSnackbarSeverity('success');
        setSnackbarMessage('Location updated successfully');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error updating location');
      setSnackbarOpen(true);
    }
  };

  //Load locations
  useEffect(() => {
    const loadLocations = async () => {
      const locations = await getCustomLocationsPersonal(user.token, MAX_RESULTS_LIMIT);
      setLocations(locations);
      setLocationsLoaded(true);
    };
    loadLocations();
  }, []);

  //Reload locations if changed
  useEffect(() => {
    if(isSaved){
      const loadLocations = async () => {
        const locations = await getCustomLocationsPersonal(user.token, MAX_RESULTS_LIMIT);
        setLocations(locations);
      };
      loadLocations();
    }
  }, [isSaved]);

  //When user clicks on a new location get data
  useEffect(() => {
    getTableData();
    updateEditFormState();
  }, [selectedLocation]);

  const updateEditFormState = () => {
    if(selectedLocation){
      setEditName(selectedLocation.name);
      setEditPopulation(selectedLocation.population);
      setEditPopulationDensity(selectedLocation.population_density);
      setEditMedianAge(selectedLocation.median_age);
      setEditAged65Older(selectedLocation.aged_65_older);
      setEditHospitalBedsPerThousand(selectedLocation.hospital_beds_per_thousand);
      setEditGDPPerCapita(selectedLocation.gdp_per_capita);
      setEditLifeExpectancy(selectedLocation.life_expectancy);
      setEditIsPublic(selectedLocation.is_public);
    }
  }

  const getTableData = () => {
    setIsDataReady(false);
    if(selectedLocation) {
      getData(
        selectedLocation.code,
        undefined,
        undefined,
        undefined,
        true
      ).then((data: IData[]) => {
        //Sort the response to get the most recent data first
        data.sort((a: IData, b: IData) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

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
            editable: key === 'date' ? false : true,
            headerName: INDICATOR_LABELS.get(key) || key,
            type: key === 'date' ? 'date' : 'number',
            width: key === 'date' ? 110 : key.length * 6.5 + 40
          });
        });

        //Add rows
        data.forEach((data: IData) => {
          const row: any = {id: data.date, date: moment(data.date).format('YYYY-MM-DD')};
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
  }

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
      <IconButton
        color="primary"
        disabled={!selectionModel.length}
        onClick={deleteSelectedData}
      >
        <DeleteIcon />
      </IconButton>
    </GridToolbarContainer>
  );

  return (
    <>
      <div className={styles.your_locations_tab}>
        <div className={styles.new_location_panel}>
          <h3>Create new location</h3>
          <div className={styles.new_location_form}>
            <TextField
              fullWidth
              label="Short code"
              variant="standard"
              size='small'
              inputProps={{ maxLength: 8 }}
              value={newCode || ''}
              onChange={(e) => {
                setNewCode(e.target.value.toUpperCase());
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Name"
              variant="standard"
              size='small'
              inputProps={{ maxLength: 120 }}
              value={newName || ''}
              onChange={(e) => {
                setNewName(e.target.value);
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Population"
              variant="standard"
              type="number"
              size='small'
              value={newPopulation || ''}
              onChange={(e) => {
                setNewPopulation(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Population density"
              variant="standard"
              type="number"
              size='small'
              value={newPopulationDensity || ''}
              onChange={(e) => {
                setNewPopulationDensity(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Median age"
              variant="standard"
              type="number"
              size='small'
              value={newMedianAge || ''}
              onChange={(e) => {
                setNewMedianAge(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Aged 65 or older (%)"
              variant="standard"
              type="number"
              size='small'
              value={newAged65Older || ''}
              onChange={(e) => {
                setNewAged65Older(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Hospital beds/1k"
              variant="standard"
              type="number"
              size='small'
              value={newHospitalBedsPerThousand || ''}
              onChange={(e) => {
                setNewHospitalBedsPerThousand(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="GDP per capita ($)"
              variant="standard"
              type="number"
              size='small'
              value={newGDPPerCapita || ''}
              onChange={(e) => {
                setNewGDPPerCapita(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <TextField
              fullWidth
              label="Life expectancy"
              variant="standard"
              type="number"
              size='small'
              value={newLifeExpectancy || ''}
              onChange={(e) => {
                setNewLifeExpectancy(Number(e.target.value));
                setIsSaved(false);
              }}
            />
            <FormGroup sx={{alignItems: 'flex-start'}}>
              <FormControlLabel sx={{marginLeft: 0}} control={
                <Switch checked={newIsPublic} onChange={(e) => {
                  setNewIsPublic(e.target.checked);
                  setIsSaved(false);
                }} />
              } label="Public" labelPlacement="start" />
            </FormGroup>
            <Button
              variant="outlined"
              color='success'
              endIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaved || newCode === '' || newName === '' || !user}
            >
              Save
            </Button>
          </div>
        </div>
        <div className={styles.your_locations_container}>
          {locationsLoaded ?
            locations.length ?
              <>
                <h3>Personal Custom Locations</h3>
                <TextField
                  type="text"
                  name="search"
                  id="search"
                  label="Search"
                  variant="outlined"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  size="small"
                  sx={{ marginBottom: '0.6em' }}
                />
                <div className={styles.locations_group}>
                {
                  locations.filter(location => location.name.toLowerCase().includes(searchFilter)).map((location, index) => (
                    <Card
                      key={location.code}
                      className={styles.locations_card}
                      onClick={() => handleDataDialogOpen(location)}
                    >
                      <CardContent className={styles.location_card_content}>
                        <h4>{location.name}</h4>
                        {location.population && <p>Population: {location.population}</p>}
                      </CardContent>
                      <div className={styles.location_card_action_buttons}>
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation();
                            handleEditDialogOpen(location);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(location);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </Card>
                  ))
                }
                </div>
              </>
            : <Alert severity="warning">No custom locations found. Try creating one!</Alert>
            : <div className={styles.spinner_container}>
                <CircularProgress />
              </div>
          }
        </div>
      </div>

      {/* DATA VIEW DIALOG */}
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
                        <TableCell>GDP per Capita</TableCell>
                        <TableCell>Life Expectancy</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ border: 0 }}>
                        <TableCell>{selectedLocation.population || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.population_density || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.median_age || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.aged_65_older ? selectedLocation.aged_65_older + '%' : 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.hospital_beds_per_thousand || 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.gdp_per_capita ? '$' + selectedLocation.gdp_per_capita : 'Unknown'}</TableCell>
                        <TableCell>{selectedLocation.life_expectancy || 'Unknown'}</TableCell>
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

      {/* DATA EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="lg">
        {selectedLocation &&
          <>
            <DialogTitle>Editing data for {selectedLocation.name}</DialogTitle>
            <DialogContent sx={{height: "80vh", paddingBottom: 0, display: 'flex', flexDirection: 'column'}}>
              <DialogContentText sx={{marginBlockEnd: '0.4em'}}>
                After modifying the data, click the &quot;Update&quot; button to save the changes.
              </DialogContentText>
              <div className={styles.edit_details_container}>
                {isDataReady
                ? <div className={styles.edit_details_form}>
                    <TextField
                      label="Name"
                      variant="standard"
                      size='small'
                      inputProps={{ maxLength: 120 }}
                      value={editName || ''}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="Population"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editPopulation || ''}
                      onChange={(e) => {
                        setEditPopulation(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="Population density"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editPopulationDensity || ''}
                      onChange={(e) => {
                        setEditPopulationDensity(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="Median age"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editMedianAge || ''}
                      onChange={(e) => {
                        setEditMedianAge(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="Aged 65 or older (%)"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editAged65Older || ''}
                      onChange={(e) => {
                        setEditAged65Older(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="Hospital beds/1k"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editHospitalBedsPerThousand || ''}
                      onChange={(e) => {
                        setEditHospitalBedsPerThousand(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="GDP per capita ($)"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editGDPPerCapita || ''}
                      onChange={(e) => {
                        setEditGDPPerCapita(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <TextField
                      label="Life expectancy"
                      variant="standard"
                      type="number"
                      size='small'
                      value={editLifeExpectancy || ''}
                      onChange={(e) => {
                        setEditLifeExpectancy(Number(e.target.value));
                        setIsEditSaved(false);
                      }}
                    />
                    <FormGroup sx={{alignItems: 'flex-start'}} className={styles.edit_details_switch}>
                      <FormControlLabel sx={{marginLeft: 0}} control={
                        <Switch checked={editIsPublic} onChange={(e) => {
                          setEditIsPublic(e.target.checked);
                          setIsEditSaved(false);
                        }} />
                      } label="Public" labelPlacement="start" />
                    </FormGroup>
                    <Button
                      className={styles.edit_details_button}
                      variant="outlined"
                      color='success'
                      endIcon={<PublishIcon />}
                      onClick={handleDetailsEdit}
                      disabled={isEditSaved || editName === '' || !user}
                    >
                      Update
                    </Button>
                  </div>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
                }
              </div>
              <DialogContentText sx={{marginBlockStart: '0.8em', marginBlockEnd: '0.4em'}}>
                Data inside the table will be automatically modified on commit.<br />
                If you want to completely delete one or multiple rows, select them from the checkbox and then click on the&nbsp;
                <DeleteIcon fontSize='small' sx={{verticalAlign: 'top'}}/> icon.
              </DialogContentText>
              <div className={styles.table_container}>
                {isDataReady
                ? <DataGrid
                    rows={displayData.rows}
                    columns={displayData.columns}
                    rowHeight={35}
                    headerHeight={45}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    components={{ Toolbar: CustomToolbar }}
                    experimentalFeatures={{ newEditingApi: true }}
                    processRowUpdate={handleRowUpdate}
                    onProcessRowUpdateError={handleRowUpdateError}
                    checkboxSelection={!!displayData.rows.length}
                    onSelectionModelChange={(newSelectionModel) => {
                      setSelectionModel(newSelectionModel);
                    }}
                    selectionModel={selectionModel}
                    disableSelectionOnClick={true}
                  />
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
                }
              </div>
              <div className={styles.table_add_section}>
                <YourLocationsAddData location={selectedLocation.code} user={user} refreshData={refreshData} />
              </div>
            </DialogContent>
          </>
        }
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default YourLocationsTab
