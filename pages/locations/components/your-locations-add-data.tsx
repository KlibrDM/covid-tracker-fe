import styles from '../../../styles/Locations.module.css'
import { useState } from 'react';
import { IData } from '../../../models/data';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Snackbar, Alert, DialogContentText } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { addCustomLocationData, addCustomLocationDataset } from '../../../lib/custom-location-data.service';
import csv from 'csvtojson';

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

  const handleUpload = async (e: any) => {
    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      if (target && target.result) {
        try {
          let jsonObj: IData[] = await csv().fromString(target.result as string);

          if(jsonObj.length === 0) {
            throw 404;
          }

          // Add location & filter unfilled data
          jsonObj = jsonObj.map((obj: IData) => ({
            location_code: location,
            date: obj.date,
            total_cases: obj.total_cases || undefined,
            new_cases: obj.new_cases || undefined,
            total_deaths: obj.total_deaths || undefined,
            new_deaths: obj.new_deaths || undefined,
            reproduction_rate: obj.reproduction_rate || undefined,
            icu_patients: obj.icu_patients || undefined,
            hosp_patients: obj.hosp_patients || undefined,
            weekly_icu_admissions: obj.weekly_icu_admissions || undefined,
            weekly_hosp_admissions: obj.weekly_hosp_admissions || undefined,
            total_tests: obj.total_tests || undefined,
            new_tests: obj.new_tests || undefined,
            positive_rate: obj.positive_rate || undefined,
            test_units: obj.test_units || undefined,
            total_vaccinations: obj.total_vaccinations || undefined,
            people_vaccinated: obj.people_vaccinated || undefined,
            people_fully_vaccinated: obj.people_fully_vaccinated || undefined,
            total_boosters: obj.total_boosters || undefined,
            new_vaccinations: obj.new_vaccinations || undefined,
            stringency_index: obj.stringency_index || undefined,
            excess_mortality: obj.excess_mortality || undefined,
            excess_mortality_cumulative: obj.excess_mortality_cumulative || undefined,
          }));

          await addCustomLocationDataset(jsonObj, user.token).then((res: any) => {
            if(!res.message) {
              setSnackbarSeverity('success');
              setSnackbarMessage('Data successfully saved from file');
              setSnackbarOpen(true);
              refreshData();
            }
            else{
              setSnackbarSeverity("error");
              setSnackbarMessage(res.message);
              setSnackbarOpen(true);
            }
          });
        }
        catch (err) {
          setSnackbarSeverity('error');
          setSnackbarMessage('Error saving data from file');
          setSnackbarOpen(true);
        }
      }
    };

    if (e.target.files[0]) {
      if(e.target.files[0].type !== 'text/csv') {
        setSnackbarSeverity('error');
        setSnackbarMessage('File must be a CSV');
        setSnackbarOpen(true);
        return;
      }
      if(e.target.files[0].size > 10000000) {
        setSnackbarSeverity('error');
        setSnackbarMessage('File must be less than 10MB');
        setSnackbarOpen(true);
        return;
      }

      reader.readAsText(e.target.files[0]);
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

      <div>
        <DialogContentText sx={{marginBlockStart: '0.4em', marginBlockEnd: '0.4em'}}>
          You can also add new data from a CSV file using the template below.
        </DialogContentText>
        <div style={{display: 'flex', gap: '8px'}}>
          <a href={'data-template.csv'} download>
            <Button
              variant="outlined"
            >
              Download template
            </Button>
          </a>
          <Button
            variant="outlined"
            color='success'
            component="label"
          >
            Upload data from file
            <input
              type="file"
              accept=".csv"
              onChange={handleUpload}
              hidden
            />
          </Button>
        </div>
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
