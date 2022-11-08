import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../components/layout'
import styles from '../../styles/Builder.module.css'
import Chart from "chart.js/auto";
import { BubbleDataPoint, CategoryScale, ChartConfiguration, ChartDataset, ChartTypeRegistry, ScatterDataPoint } from "chart.js";
import { Chart as ChartJS } from "react-chartjs-2";
import { useEffect, useRef, useState } from 'react';
import { loadLocations } from '../../lib/load-locations';
import { ILocation } from '../../models/location';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Alert, CircularProgress, FormControlLabel, FormGroup, Snackbar, Switch } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import _ from 'lodash';
import { IChart, IChartValue, IIndicatorSettings, Indicators } from '../../models/custom-charts';
import { COMMON_CHART_OPTIONS } from '../../lib/chart-options';
import { getData } from '../../lib/get-data';
import { IData } from '../../models/data';
import { fourteenDayAverage } from '../../utils/calculate-14-day-average';
import { sevenDayAverage } from '../../utils/calculate-7-day-average';
import { ColorToHex } from '../../utils/hexrgb';
import BuilderDialog from './components/builder-dialog';
import UploadIcon from '@mui/icons-material/Upload';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { saveCustomChart } from '../../lib/save-custom-chart';
import BuilderLoadDialog from './components/load-dialog';
import { updateCustomChart } from '../../lib/update-custom-chart';

Chart.register(CategoryScale);

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const Builder: NextPage = (props: any) => {
  const user = props.user;
  const [chartReady, setChartReady] = useState<boolean>(false);

  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];

  const [startDate, setStartDate] = useState<moment.Moment>(moment().subtract(1, 'year'));
  const [endDate, setEndDate] = useState<moment.Moment>(moment());
  const [dateChanged, setDateChanged] = useState<boolean>(false);

  const [loadedChartId, setLoadedChartId] = useState<string | null>(null);
  const [loadedChartOwner, setLoadedChartOwner] = useState<string | null>(null);
  const [chipData, setChipData] = useState<IChartValue[]>([]);
  const [chartName, setChartName] = useState<string>("New chart");
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState<boolean>(false);
  const indicatorDialogRef = useRef(null);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState<boolean>(false);
  const [newChartLoaded, setNewChartLoaded] = useState<boolean>(false);
  const loadDialogRef = useRef(null);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const customChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [];
  const customChartLabels: string[] = [];
  const customChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: customChartLabels,
      datasets: customChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const [customChart, setCustomChart] = useState(customChartConfiguration);
  const customChartRef = useRef(null);

  const handleChipDelete = (chipIndex: number) => () => {
    //Remove chip and rebuild chart
    chipData.splice(chipIndex, 1);
    buildChart();
  };

  const handleIndicatorClickOpen = () => {
    setIsIndicatorDialogOpen(true);
    //@ts-ignore
    indicatorDialogRef.current.updateDialogState(true);
  };

  const handleIndicatorClose = () => {
    setIsIndicatorDialogOpen(false);
    //@ts-ignore
    indicatorDialogRef.current.updateDialogState(false);
  };

  const handleIndicatorAdd = (data: any) => {
    const newIndicator: IIndicatorSettings = { 
      key: data.dialogIndicator,
      per_million: data.dialogIndicatorPerMillion,
      average: data.dialogIndicatorAverage7Days ? 7 : data.dialogIndicatorAverage14Days ? 14 : undefined,
      label: Indicators.find(e => e.key === data.dialogIndicator)?.label + (data.dialogIndicatorPerMillion ? " per million" : "") + (data.dialogIndicatorAverage7Days ? " (7 days average)" : data.dialogIndicatorAverage14Days ? " (14 days average)" : ""),
    };

    const chartValue: IChartValue = {
      indicator: newIndicator,
      location_code: data.dialogLocation,
      chart_type: data.dialogChartType,
      color: data.dialogColor,
      fill: data.dialogChartType === "area" ? {
        target: 'origin',
        above: data.dialogAreaColorAbove + ColorToHex(Math.round((1 - data.dialogAreaColorAboveTransparency) * 255)),
        below: data.dialogAreaColorBelow + ColorToHex(Math.round((1 - data.dialogAreaColorBelowTransparency) * 255))
      } : undefined
    };

    //Add new value to chips and rebuild chart
    chipData.push(chartValue);

    buildChart();

    setIsIndicatorDialogOpen(false);
    //@ts-ignore
    indicatorDialogRef.current.updateDialogState(false);
  };

  const buildChart = async () => {
    const datasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [];
    const labels: Set<string> = new Set();

    for(let i = 0; i < chipData.length; i++){
      const e = chipData[i];
      const data: IData[] = await getData(e.location_code, e.indicator.key, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
      const dataset: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]> = {
        type: e.chart_type === 'area' ? 'line' : e.chart_type,
        label: e.location_code + ' - ' + e.indicator.label,
        data: [],
        fill: e.chart_type === 'area' ? e.fill : undefined,
        backgroundColor: e.color,
        borderColor: e.color,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      };

      const perNumber = 1000000;
      const population = locations.find(elem => elem.code === e.location_code)?.population ?? perNumber;

      //if key is not a 'new' value, fill empty spaces with last data
      let lastData = 0;
      data.forEach(dataDay => {
        labels.add(moment(dataDay.date).format('YYYY-MM-DD'));
        if(dataDay[e.indicator.key as keyof typeof dataDay]){
          let dayData = dataDay[e.indicator.key as keyof typeof dataDay] as number;

          if(e.indicator.per_million){
            dayData = (dayData! / population) * perNumber
          }

          //Save last data only if key is not new value
          if(!e.indicator.key.includes('new')){
            lastData = dayData!;
          }
          dataset.data.push(dayData!);
        }
        else{
          dataset.data.push(lastData);
        }
      });

      if(e.indicator.average){
        if(e.indicator.average === 7){
          dataset.data = sevenDayAverage(dataset.data);
        }
        else if(e.indicator.average === 14){
          dataset.data = fourteenDayAverage(dataset.data);
        }
      }

      datasets.unshift(dataset);
    }

    customChart.data.datasets = datasets;
    customChart.data.labels = Array.from(labels);
    setCustomChart(_.cloneDeep(customChart));
    
    //Remove refresh icon
    setDateChanged(false);

    //Set saved status
    setIsSaved(false);
  
    //Reset chart zoom
    if (customChartRef && customChartRef.current) {
      //@ts-ignore
      customChartRef.current.resetZoom();
    }
  };

  const handleSave = async () => {
    const payload: IChart = {
      ownerId: user._id,
      is_public: isPublic,
      name: chartName,
      start_date: new Date(startDate.format('YYYY-MM-DD')),
      end_date: new Date(endDate.format('YYYY-MM-DD')),
      values: chipData
    };

    try {
      const response = await saveCustomChart(payload, user.token);
      if(response.message){
        setSnackbarSeverity('error');
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
      }
      else{
        setIsSaved(true);
        setLoadedChartId(response._id);
        setLoadedChartOwner(response.ownerId);

        //Snackbar
        setSnackbarSeverity('success');
        setSnackbarMessage('Chart saved successfully');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error saving chart');
      setSnackbarOpen(true);
    }
  };

  const handleUpdate = async () => {
    const payload: IChart = {
      ownerId: user._id,
      is_public: isPublic,
      name: chartName,
      start_date: new Date(startDate.format('YYYY-MM-DD')),
      end_date: new Date(endDate.format('YYYY-MM-DD')),
      values: chipData
    };

    try {
      const response = await updateCustomChart(payload, loadedChartId!, user.token);
      if(response.message){
        setSnackbarSeverity('error');
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
      }
      else{
        setIsSaved(true);

        //Snackbar
        setSnackbarSeverity('success');
        setSnackbarMessage('Chart updated successfully');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error updating chart');
      setSnackbarOpen(true);
    }
  };

  const handleLoadButtonClick = async () => {
    setIsLoadDialogOpen(true);
    //@ts-ignore
    loadDialogRef.current.updateDialogState(true);
  }

  const handleLoadClose = () => {
    setIsLoadDialogOpen(false);
    //@ts-ignore
    loadDialogRef.current.updateDialogState(false);
  }

  const handleLoadChart = (chart: (IChart & {_id: string})) => {
    setIsLoadDialogOpen(false);
    //@ts-ignore
    loadDialogRef.current.updateDialogState(false);

    setLoadedChartId(chart._id);
    setLoadedChartOwner(chart.ownerId);
    setChartName(chart.name);
    setIsPublic(chart.is_public);
    setStartDate(moment(chart.start_date));
    setEndDate(moment(chart.end_date));
    setChipData(chart.values);
    setNewChartLoaded(true);
  }

  //After state updated with new chart, rebuild chart
  useEffect(() => {
    if(newChartLoaded){
      buildChart();
      setNewChartLoaded(false);
    }
  }, [newChartLoaded]);

  useEffect(() => {
    async function loadZoom() {
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      Chart.register(zoomPlugin);
      setChartReady(true);
    } loadZoom();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Chart Builder</title>
        <meta name="description" content="CovidTracker Chart Builder" />
      </Head>

      <section className={styles.page_container}>
        <section className={styles.settings_section}>
          <div className={styles.settings_section_header}>
            <h2>Create custom chart
              {!user && <span className={styles.settings_section_header_login_warning}>Login to save charts</span>}
            </h2>
          </div>
          <div className={styles.settings_date_picker}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newDate) => {
                  setStartDate(newDate!);
                  setDateChanged(true);
                }}
                renderInput={(params) => <TextField size='small' {...params} />}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newDate) => {
                  setEndDate(newDate!);
                  setDateChanged(true);
                }}
                renderInput={(params) => <TextField size='small' {...params} />}
              />
            </LocalizationProvider>
            {(dateChanged && customChart.data.datasets.length > 0) && 
              <IconButton
                onClick={(e => {
                  //Date changed is set to false in buildChart
                  buildChart();
                })}
              >
                <RefreshIcon />
              </IconButton>}
          </div>
          
          <div className={styles.settings_chip_container}>
            <Paper className={styles.settings_chip_paper} variant="outlined" component="ul">
              {
                chipData.length 
                ? chipData.map((data, index) => {
                    return (
                      <ListItem key={index}>
                        <Chip
                          sx={{borderWidth: 2, borderStyle: 'solid', borderColor: data.color}}
                          label={data.location_code + ' - ' + data.indicator.label}
                          onDelete={handleChipDelete(index)}
                          size="small"
                        />
                      </ListItem>
                    );
                  })
                : <p>No indicators selected</p>
              }
            </Paper>
            
            <Button
              size="small"
              variant="outlined"
              endIcon={<AddIcon />}
              onClick={handleIndicatorClickOpen}
              className={styles.settings_chip_button}
            >
              Add new indicator
            </Button>
          </div>
          
          <div className={styles.settings_name_container}>
            <TextField
              fullWidth
              label="Chart Name"
              variant="standard"
              size='small'
              inputProps={{ maxLength: 120 }}
              value={chartName}
              onChange={(e) => {
                setChartName(e.target.value);
                setIsSaved(false);
              }}/>
            <FormGroup className={styles.settings_public_switch}>
              <FormControlLabel control={
                <Switch checked={isPublic} onChange={(e) => {
                  setIsPublic(e.target.checked);
                  setIsSaved(false);
                }} />
              } label="Public" labelPlacement="start" />
            </FormGroup>
            <Button
              size="small"
              variant="outlined"
              color='primary'
              endIcon={<UploadIcon />}
              onClick={handleLoadButtonClick}
              className={styles.settings_save_load_button}
            >
              Load
            </Button>
            {loadedChartId && user && loadedChartOwner === user._id &&
              <Button
                size="small"
                variant="outlined"
                color='warning'
                endIcon={<AutoFixHighIcon />}
                onClick={handleUpdate}
                className={styles.settings_save_load_button}
                disabled={isSaved || chartName === '' || chipData.length === 0 || !user}
              >
                Modify
              </Button>
            }
            <Button
              size="small"
              variant="outlined"
              color='success'
              endIcon={<SaveIcon />}
              onClick={handleSave}
              className={styles.settings_save_load_button}
              disabled={isSaved || chartName === '' || chipData.length === 0 || !user}
            >
              {loadedChartId ? 'Save New' : 'Save'}
            </Button>
          </div>
        </section>
        
        <section className={styles.chart_container}>
          {
            chartReady
            ? <ChartJS ref={customChartRef} type={customChart.type} data={customChart.data} options={customChart.options}/>
            : <div className={styles.spinner_container}>
                <CircularProgress />
              </div>
          }
        </section>
      </section>

      <BuilderDialog
        ref={indicatorDialogRef}
        location={location}
        locations={locations}
        handleIndicatorClose={handleIndicatorClose}
        handleIndicatorAdd={handleIndicatorAdd}
        isIndicatorDialogOpen={isIndicatorDialogOpen}
      />

      <BuilderLoadDialog 
        ref={loadDialogRef}
        user={user}
        handleLoadClose={handleLoadClose}
        handleLoadChart={handleLoadChart}
        isLoadDialogOpen={isLoadDialogOpen}
      />

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  return { props: {
    location: location,
    locations: locations,
    user: user,
  } };
}

export default Builder
