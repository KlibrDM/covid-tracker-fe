import styles from '../../../styles/Locations.module.css'
import { useState } from 'react';
import { IData } from '../../../models/data';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Snackbar, Alert } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { addCustomLocationData } from '../../../lib/custom-location-data.service';

const YourLocationsAddData = (props: any) => {
  const user = props.user || {};
  const location = props.location as string;
  const refreshData = props.refreshData as Function;
  const [data, setData] = useState<IData>({
    location_code: location,
    date: new Date()
  });

  //Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");

  const handleSave = async () => {
    try {
      //Get rid of the time
      data.date = new Date(moment(data.date).format('YYYY-MM-DD'));
      await addCustomLocationData(data, user.token).then((res: any) => {
        if(!res.message) {
          refreshData();
        }
        else{
          setSnackbarSeverity("error");
          setSnackbarMessage(res.message);
          setSnackbarOpen(true);
        }
      });
    } catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error saving data');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <div className={styles.your_locations_add}>
        <div className={styles.your_locations_add_date}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="Start Date"
              value={data.date}
              onChange={(newDate) => {
                setData({...data, date: newDate!});
              }}
              renderInput={(params) => <TextField variant="standard" size='small' {...params} />}
            />
          </LocalizationProvider>
        </div>
        <div className={styles.your_locations_add_fields}>
          <TextField
            label="Total cases"
            variant="standard"
            size='small'
            type='number'
            value={data.total_cases || ''}
            onChange={(e) => {
              setData({...data, total_cases: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="New cases"
            variant="standard"
            size='small'
            type='number'
            value={data.new_cases || ''}
            onChange={(e) => {
              setData({...data, new_cases: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Total deaths"
            variant="standard"
            size='small'
            type='number'
            value={data.total_deaths || ''}
            onChange={(e) => {
              setData({...data, total_deaths: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="New deaths"
            variant="standard"
            size='small'
            type='number'
            value={data.new_deaths || ''}
            onChange={(e) => {
              setData({...data, new_deaths: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Reproduction rate"
            variant="standard"
            size='small'
            type='number'
            value={data.reproduction_rate || ''}
            onChange={(e) => {
              setData({...data, reproduction_rate: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="ICU patients"
            variant="standard"
            size='small'
            type='number'
            value={data.icu_patients || ''}
            onChange={(e) => {
              setData({...data, icu_patients: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Weekly ICU admissions"
            variant="standard"
            size='small'
            type='number'
            value={data.weekly_icu_admissions || ''}
            onChange={(e) => {
              setData({...data, weekly_icu_admissions: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Hospital patients"
            variant="standard"
            size='small'
            type='number'
            value={data.hosp_patients || ''}
            onChange={(e) => {
              setData({...data, hosp_patients: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Weekly Hospital admissions"
            variant="standard"
            size='small'
            type='number'
            value={data.weekly_hosp_admissions || ''}
            onChange={(e) => {
              setData({...data, weekly_hosp_admissions: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Total tests"
            variant="standard"
            size='small'
            type='number'
            value={data.total_tests || ''}
            onChange={(e) => {
              setData({...data, total_tests: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="New tests"
            variant="standard"
            size='small'
            type='number'
            value={data.new_tests || ''}
            onChange={(e) => {
              setData({...data, new_tests: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Positive rate"
            variant="standard"
            size='small'
            type='number'
            value={data.positive_rate || ''}
            onChange={(e) => {
              setData({...data, positive_rate: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Test units"
            variant="standard"
            size='small'
            value={data.test_units || ''}
            onChange={(e) => {
              setData({...data, test_units: e.target.value});
            }}
          />
          <TextField
            label="Total vaccinations"
            variant="standard"
            size='small'
            type='number'
            value={data.total_vaccinations || ''}
            onChange={(e) => {
              setData({...data, total_vaccinations: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="People vaccinated"
            variant="standard"
            size='small'
            type='number'
            value={data.people_vaccinated || ''}
            onChange={(e) => {
              setData({...data, people_vaccinated: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="People fully vaccinated"
            variant="standard"
            size='small'
            type='number'
            value={data.people_fully_vaccinated || ''}
            onChange={(e) => {
              setData({...data, people_fully_vaccinated: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Total boosters"
            variant="standard"
            size='small'
            type='number'
            value={data.total_boosters || ''}
            onChange={(e) => {
              setData({...data, total_boosters: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="New vaccinations"
            variant="standard"
            size='small'
            type='number'
            value={data.new_vaccinations || ''}
            onChange={(e) => {
              setData({...data, new_vaccinations: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Stringency index"
            variant="standard"
            size='small'
            type='number'
            value={data.stringency_index || ''}
            onChange={(e) => {
              setData({...data, stringency_index: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Excess mortality"
            variant="standard"
            size='small'
            type='number'
            value={data.excess_mortality || ''}
            onChange={(e) => {
              setData({...data, excess_mortality: parseFloat(e.target.value)});
            }}
          />
          <TextField
            label="Excess mortality cumulative"
            variant="standard"
            size='small'
            type='number'
            value={data.excess_mortality_cumulative || ''}
            onChange={(e) => {
              setData({...data, excess_mortality_cumulative: parseFloat(e.target.value)});
            }}
          />
        </div>
        <Button
          className={styles.your_locations_add_button}
          variant="outlined"
          color='success'
          endIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Add
        </Button>
      </div>

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

export default YourLocationsAddData
