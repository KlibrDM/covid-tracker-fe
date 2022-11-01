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
import { CircularProgress, FormControlLabel, FormGroup, Switch, FormControl, InputLabel, Select, Slider, } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import moment from 'moment';
import _ from 'lodash';
import { ChartType, ChartTypes, IChartValue, IIndicatorSettings, Indicators } from '../../models/custom-charts';
import { COMMON_CHART_OPTIONS } from '../../lib/chart-options';
import { getData } from '../../lib/get-data';
import { IData } from '../../models/data';
import { fourteenDayAverage } from '../../utils/calculate-14-day-average';
import { sevenDayAverage } from '../../utils/calculate-7-day-average';
import { ColorToHex } from '../../utils/hexrgb';

Chart.register(CategoryScale);

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const Builder: NextPage = (props: any) => {
  const [chartReady, setChartReady] = useState<boolean>(false);

  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [startDate, setStartDate] = useState<moment.Moment>(moment().subtract(1, 'year'));
  const [endDate, setEndDate] = useState<moment.Moment>(moment());
  const [dateChanged, setDateChanged] = useState<boolean>(false);

  const [chipData, setChipData] = useState<IChartValue[]>([]);
  const [chartName, setChartName] = useState<string>("New chart");
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState<boolean>(false);
  const [dialogIndicator, setDialogIndicator] = useState<string>(Indicators[0].key);
  const [dialogIndicatorPerMillion, setDialogIndicatorPerMillion] = useState<boolean>(false);
  const [dialogIndicatorAverage7Days, setDialogIndicatorAverage7Days] = useState<boolean>(false);
  const [dialogIndicatorAverage14Days, setDialogIndicatorAverage14Days] = useState<boolean>(false);
  const [dialogLocation, setDialogLocation] = useState<string>(location);
  const [dialogChartType, setDialogChartType] = useState<ChartType>(ChartTypes[0]);
  const [dialogColor, setDialogColor] = useState<string>("#12b3eb");
  let auxDialogColor = "#12b3eb";
  const [dialogAreaColorAbove, setDialogAreaColorAbove] = useState<string>("#12b3eb");
  const [dialogAreaColorAboveTransparency, setDialogAreaColorAboveTransparency] = useState<number>(0.6);
  let auxDialogAreaColorAbove = "#12b3eb";
  const [dialogAreaColorBelow, setDialogAreaColorBelow] = useState<string>("#12b3eb");
  const [dialogAreaColorBelowTransparency, setDialogAreaColorBelowTransparency] = useState<number>(0.6);
  let auxDialogAreaColorBelow = "#12b3eb";

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

  const handleDelete = (chipToDelete: IChartValue) => () => {
    //Remove chip and rebuild chart
    chipData.splice(chipData.findIndex(chip => chip.id === chipToDelete.id), 1);
    buildChart();
  };

  const handleIndicatorClickOpen = () => {
    setIsIndicatorDialogOpen(true);
  };

  const handleIndicatorClose = () => {
    setIsIndicatorDialogOpen(false);
  };

  const handleIndicatorAdd = () => {
    const newIndicator: IIndicatorSettings = { 
      key: dialogIndicator,
      perMillion: dialogIndicatorPerMillion,
      average: dialogIndicatorAverage7Days ? 7 : dialogIndicatorAverage14Days ? 14 : undefined,
      label: Indicators.find(e => e.key === dialogIndicator)?.label + (dialogIndicatorPerMillion ? " per million" : "") + (dialogIndicatorAverage7Days ? " (7 days average)" : dialogIndicatorAverage14Days ? " (14 days average)" : ""),
    };

    const chartValue: IChartValue = {
      id: _.uniqueId(),
      indicator: newIndicator,
      location_code: dialogLocation,
      chart_type: dialogChartType,
      color: dialogColor,
      fill: dialogChartType === "area" ? {
        target: 'origin',
        above: dialogAreaColorAbove + ColorToHex(Math.round((1 - dialogAreaColorAboveTransparency) * 255)),
        below: dialogAreaColorBelow + ColorToHex(Math.round((1 - dialogAreaColorBelowTransparency) * 255))
      } : undefined
    };

    //Add new value to chips and rebuild chart
    chipData.push(chartValue);

    buildChart();

    setIsIndicatorDialogOpen(false);
  };

  const buildChart = async () => {
    const datasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [];
    const labels: Set<string> = new Set();

    for(let i = 0; i < chipData.length; i++){
      const e = chipData[i];
      const data: IData[] = await getData(e.location_code, e.indicator.key, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
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

          if(e.indicator.perMillion){
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
  
    //Reset chart zoom
    if (customChartRef && customChartRef.current) {
      //@ts-ignore
      customChartRef.current.resetZoom();
    }
  };

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
            <h2>Create custom chart</h2>
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
            <Paper className={styles.settings_chip_paper} component="ul">
              {
                chipData.length 
                ? chipData.map((data) => {
                    return (
                      <ListItem key={data.id}>
                        <Chip
                          label={data.location_code + ' - ' + data.indicator.label}
                          onDelete={handleDelete(data)}
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
            <TextField fullWidth label="Chart Name" variant="standard" size='small' value={chartName} onChange={(e) => {setChartName(e.target.value)}}/>
            <FormGroup className={styles.settings_public_switch}>
              <FormControlLabel control={<Switch checked={isPublic} onChange={(e) => {setIsPublic(e.target.checked)}} />} label="Public" labelPlacement="start" />
            </FormGroup>
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

      <Dialog open={isIndicatorDialogOpen} onClose={handleIndicatorClose}>
        <DialogTitle>New indicator</DialogTitle>
        <DialogContent>
          <FormControl variant="standard" fullWidth>
            <InputLabel shrink={true} htmlFor="indicator">Indicator</InputLabel>
            <Select
              native
              labelId="indicator"
              label="Indicator"
              defaultValue={dialogIndicator}
              onChange={(e => {setDialogIndicator(e.target.value as string)})}
            >
              {
                Indicators.map((indicator, index) => (
                  <option key={index} value={indicator.key}>{indicator.label}</option>
                ))
              }
            </Select>
          </FormControl>

          <FormGroup>
            <FormControlLabel control={
              <Switch checked={dialogIndicatorPerMillion} onChange={(e) => {setDialogIndicatorPerMillion(e.target.checked)}} />
            } label="Calculate per million" labelPlacement="end" />
          </FormGroup>

          <FormGroup>
            <FormControlLabel control={
              <Switch checked={dialogIndicatorAverage7Days} onChange={(e) => {
                setDialogIndicatorAverage7Days(e.target.checked);
                if(e.target.checked) { setDialogIndicatorAverage14Days(false); }
              }} />
            } label="Calculate 7 day average" labelPlacement="end" />
          </FormGroup>

          <FormGroup>
            <FormControlLabel control={
              <Switch checked={dialogIndicatorAverage14Days} onChange={(e) => {
                setDialogIndicatorAverage14Days(e.target.checked);
                if(e.target.checked) { setDialogIndicatorAverage7Days(false); }
              }} />
            } label="Calculate 14 day average" labelPlacement="end" />
          </FormGroup>

          <FormControl variant="standard" fullWidth>
            <InputLabel shrink={true} htmlFor="location">Location</InputLabel>
            <Select
              native
              labelId="location"
              label="Location"
              defaultValue={dialogLocation}
              onChange={(e => {setDialogLocation(e.target.value as string)})}
            >
              {
                locations.map((location, index) => (
                  <option key={index} value={location.code}>{location.name}</option>
                ))
              }
            </Select>
          </FormControl>

          <FormControl variant="standard" fullWidth>
            <InputLabel shrink={true} htmlFor="chart-type">Chart Type</InputLabel>
            <Select
              native
              labelId="chart-type"
              label="Chart Type"
              defaultValue={dialogChartType}
              onChange={(e => {setDialogChartType(e.target.value as ChartType)})}
            >
              {
                ChartTypes.map((chartType, index) => (
                  <option key={index} value={chartType}>{chartType.slice(0,1).toUpperCase() + chartType.slice(1)}</option>
                ))
              }
            </Select>
          </FormControl>

          <div className={styles.dialog_color_button}>
            <label htmlFor='color'>Color</label>
            <input
              type="color"
              id="color"
              name="color"
              value={dialogColor}
              onChange={(e => {auxDialogColor = e.target.value})}
              onBlur={(e => {setDialogColor(auxDialogColor)})}
            />
          </div>

          {dialogChartType === 'area' &&
            <div>
              <div className={styles.dialog_color_button}>
                <label htmlFor='colorAbove'>Area above 0</label>
                <input
                  type="color"
                  id="colorAbove"
                  name="colorAbove"
                  value={dialogAreaColorAbove}
                  onChange={(e => {auxDialogAreaColorAbove = e.target.value})}
                  onBlur={(e => {setDialogAreaColorAbove(auxDialogAreaColorAbove)})}
                />
              </div>
              <div className={styles.dialog_transparency_slider}>
                <p>Transparency</p>
                <Slider
                  value={dialogAreaColorAboveTransparency}
                  aria-label="Area color above transparency"
                  valueLabelDisplay="auto"
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e, value) => {setDialogAreaColorAboveTransparency(value as number)}}
                />
              </div>
              <div className={styles.dialog_color_button}>
                <label htmlFor='colorBelow'>Area below 0</label>
                <input
                  type="color"
                  id="colorBelow"
                  name="colorBelow"
                  value={dialogAreaColorBelow}
                  onChange={(e => {auxDialogAreaColorBelow = e.target.value})}
                  onBlur={(e => {setDialogAreaColorBelow(auxDialogAreaColorBelow)})}
                />
              </div>
              <div className={styles.dialog_transparency_slider}>
                <p>Transparency</p>
                <Slider
                  value={dialogAreaColorBelowTransparency}
                  aria-label="Area color below transparency"
                  valueLabelDisplay="auto"
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e, value) => {setDialogAreaColorBelowTransparency(value as number)}}
                />
              </div>
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIndicatorClose}>Cancel</Button>
          <Button onClick={handleIndicatorAdd}>Add</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';

  return { props: {
    location: location,
    locations: locations,
  } };
}

export default Builder
