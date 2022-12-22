import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../shared-components/layout'
import styles from '../../styles/ChartPage.module.css'
import Chart from "chart.js/auto";
import { BubbleDataPoint, CategoryScale, ChartConfiguration, ChartDataset, ChartTypeRegistry, ScatterDataPoint } from "chart.js";
import { Chart as ChartJS } from "react-chartjs-2";
import { IData } from '../../models/data';
import { getData } from '../../lib/data.service';
import { useEffect, useRef, useState } from 'react';
import LatestData from '../../shared-components/latest-data';
import { getLatestData } from '../../lib/data.service';
import { loadLocations } from '../../lib/location.service';
import { ILocation } from '../../models/location';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CircularProgress, FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';
import moment from 'moment';
import _ from 'lodash';
import { CASES_CHART_OPTIONS } from '../../lib/chart-options';
import { DEFAULT_CHART_TYPES, DEFAULT_START_DATES, HOSPITAL_COLOR, HOSPITAL_FILL_COLORS, ICU_COLOR, ICU_FILL_COLORS, STRINGENCY_INDEX_COLOR, STRINGENCY_INDEX_FILL_COLORS } from '../../lib/constants';
import { IChartType } from '../../models/charts';
import { isChartEmpty } from '../../utils/isChartEmpty';
import { IUser } from '../../models/user';

Chart.register(CategoryScale);

const startDates = DEFAULT_START_DATES;
const chartTypes: IChartType[] = DEFAULT_CHART_TYPES;

const defaultStartDate = startDates[1].date;
const defaultChartType: IChartType = chartTypes[0];

const Hospitalizations: NextPage = (props: any) => {
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [chartType, setChartType] = useState<string>(defaultChartType.value);
  const [showStringency, setShowStringency] = useState<boolean>(false);
  const [chartReady, setChartReady] = useState<boolean>(false);

  const user = props.user as IUser;
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;
  const latestData = props.latestData as IData[];
  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(false);

  //Get chart data
  const chartLabels: string[] = props.chartLabels;
  const hospPatients: number[] = props.hospPatients;
  const icuPatients: number[] = props.icuPatients;
  const weeklyHospAdmissions: number[] = props.weeklyHospAdmissions;
  const weeklyICUAdmissions: number[] = props.weeklyICUAdmissions;
  const [stringencyIndex, setStringencyIndex] = useState<number[]>(props.stringencyIndex);
  
  //Build charts
  const patientsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Hospital Patients',
      data: hospPatients,
      fill: HOSPITAL_FILL_COLORS,
      backgroundColor: HOSPITAL_COLOR,
      borderColor: HOSPITAL_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 3,
    },
    {
      label: 'ICU Patients',
      data: icuPatients,
      fill: ICU_FILL_COLORS,
      backgroundColor: ICU_COLOR,
      borderColor: ICU_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      order: 2,
    },
    {
      type: 'line',
      label: 'Stringency Index',
      data: showStringency ? stringencyIndex : [],
      fill: STRINGENCY_INDEX_FILL_COLORS,
      backgroundColor: STRINGENCY_INDEX_COLOR,
      borderColor: STRINGENCY_INDEX_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      pointHoverRadius: 0,
      tension: 0.1,
      order: 1,
      yAxisID: 'percentage',
    }
  ];
  const patientsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: patientsChartDatasets
    },
    options: CASES_CHART_OPTIONS(patientsChartDatasets)
  };

  const admissionsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Weekly Hospital Admissions',
      data: weeklyHospAdmissions,
      fill: HOSPITAL_FILL_COLORS,
      backgroundColor: HOSPITAL_COLOR,
      borderColor: HOSPITAL_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 3,
    },
    {
      label: 'Weekly ICU Admissions',
      data: weeklyICUAdmissions,
      fill: ICU_FILL_COLORS,
      backgroundColor: ICU_COLOR,
      borderColor: ICU_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      order: 2,
    },
    {
      type: 'line',
      label: 'Stringency Index',
      data: showStringency ? stringencyIndex : [],
      fill: STRINGENCY_INDEX_FILL_COLORS,
      backgroundColor: STRINGENCY_INDEX_COLOR,
      borderColor: STRINGENCY_INDEX_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      pointHoverRadius: 0,
      tension: 0.1,
      order: 1,
      yAxisID: 'percentage',
    }
  ];
  const admissionsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: admissionsChartDatasets
    },
    options: CASES_CHART_OPTIONS(admissionsChartDatasets)
  };

  const [patientsChart, setPatientsChart] = useState(patientsChartConfiguration);
  const [admissionsChart, setAdmissionsChart] = useState(admissionsChartConfiguration);

  const patientsChartRef = useRef(null);
  const admissionsChartRef = useRef(null);

  useEffect(() => {
    async function loadZoom() {
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      Chart.register(zoomPlugin);
      setChartReady(true);
    } loadZoom();
  }, []);

  const handleStartDateChange = (event: React.MouseEvent<HTMLElement>, newStartDate: string | null) => {
    if (newStartDate) {
      const queryStartDate = newStartDate === 'ALL' ? '' : newStartDate;

      //load data with new start date
      getData(location, ['hosp_patients', 'icu_patients', 'weekly_hosp_admissions', 'weekly_icu_admissions', 'stringency_index'], queryStartDate, undefined, isCustomLocation).then((data: IData[]) => {
        const {
          chartLabels,
          hospPatients,
          icuPatients,
          weeklyHospAdmissions,
          weeklyICUAdmissions,
          stringencyIndex
        } = prepareChartData(data);

        //Set data
        patientsChart.data.datasets[0].data = hospPatients;
        patientsChart.data.datasets[1].data = icuPatients;
        patientsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        patientsChart.data.labels = chartLabels;

        admissionsChart.data.datasets[0].data = weeklyHospAdmissions;
        admissionsChart.data.datasets[1].data = weeklyICUAdmissions;
        admissionsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        admissionsChart.data.labels = chartLabels;

        setStringencyIndex(stringencyIndex);

        setPatientsChart(_.cloneDeep(patientsChart));
        setAdmissionsChart(_.cloneDeep(admissionsChart));

        setStartDate(newStartDate);
      });

      //Reset chart zoom
      if (patientsChartRef && patientsChartRef.current) {
        //@ts-ignore
        patientsChartRef.current.resetZoom();
      }
      if (admissionsChartRef && admissionsChartRef.current) {
        //@ts-ignore
        admissionsChartRef.current.resetZoom();
      }
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
    if (newChartType) {
      const chartType = chartTypes.find(e => e.value === newChartType);

      if(chartType){
        patientsChart.type = chartType.type;
        setUnsetArea(patientsChart, chartType, [HOSPITAL_FILL_COLORS, ICU_FILL_COLORS]);
        setPatientsChart(_.cloneDeep(patientsChart));

        admissionsChart.type = chartType.type;
        setUnsetArea(admissionsChart, chartType, [HOSPITAL_FILL_COLORS, ICU_FILL_COLORS]);
        setAdmissionsChart(_.cloneDeep(admissionsChart));
        
        setChartType(chartType.value);
      }
    }
  }

  const handleStringencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if(checked){
      patientsChart.data.datasets[2].data = stringencyIndex;
      admissionsChart.data.datasets[2].data = stringencyIndex;
    }
    else{
      patientsChart.data.datasets[2].data = [];
      admissionsChart.data.datasets[2].data = [];
    }
    setPatientsChart(_.cloneDeep(patientsChart));
    setAdmissionsChart(_.cloneDeep(admissionsChart));
    setShowStringency(checked);
  }

  const setUnsetArea = (chart: ChartConfiguration, chartType: IChartType, fillColors: any[]) => {
    if(chartType.value === 'area'){
      chart.data.datasets.forEach((dataset, index) => {
        if(!dataset.type){
          //@ts-ignore
          dataset.fill = fillColors[index] || fillColors[0];
        }
      });
    }
    else{
      chart.data.datasets.forEach(dataset => {
        if(!dataset.type){
          //@ts-ignore
          dataset.fill = false;
        }
      });
    }
  }

  const changeLocation = (newLocation: string, isCustom?: boolean) => {
    if(isCustom){
      setIsCustomLocation(true);
    }
    else{
      setIsCustomLocation(false);
    }

    if (newLocation) {
      const queryStartDate = startDate === 'ALL' ? '' : startDate;

      //load data with new location
      getData(newLocation, ['hosp_patients', 'icu_patients', 'weekly_hosp_admissions', 'weekly_icu_admissions', 'stringency_index'], queryStartDate, undefined, isCustom).then((data: IData[]) => {
        const {
          chartLabels,
          hospPatients,
          icuPatients,
          weeklyHospAdmissions,
          weeklyICUAdmissions,
          stringencyIndex
        } = prepareChartData(data);

        //Set data
        patientsChart.data.datasets[0].data = hospPatients;
        patientsChart.data.datasets[1].data = icuPatients;
        patientsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        patientsChart.data.labels = chartLabels;

        admissionsChart.data.datasets[0].data = weeklyHospAdmissions;
        admissionsChart.data.datasets[1].data = weeklyICUAdmissions;
        admissionsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        admissionsChart.data.labels = chartLabels;

        setStringencyIndex(stringencyIndex);

        setPatientsChart(_.cloneDeep(patientsChart));
        setAdmissionsChart(_.cloneDeep(admissionsChart));

        setLocation(newLocation);
      });
    }
  }

  return (
    <Layout>
      <Head>
        <title>Hospitalizations</title>
        <meta name="description" content="CovidTracker Hospitalizations" />
      </Head>

      <section className={styles.page_container}>
        <section className={styles.charts_section}>
          <div className={styles.page_details}>
            <h1 className={styles.page_title}>Covid-19 Hospitalizations in {locationName}</h1>
            <p className={styles.page_subtitle}>
              Source: <a href='https://ourworldindata.org/explorers/coronavirus-data-explorer'>Our World in Data</a>
            </p>
          </div>
          <div className={styles.chart_controller}>
            <div className={styles.chart_controller_buttons}>
              <ToggleButtonGroup
                color="primary"
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                aria-label="Chart Type"
                size="small"
              >
                {chartTypes.map((chartType) => (
                  <ToggleButton key={chartType.label} value={chartType.value} aria-label={chartType.label}>
                    {chartType.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <ToggleButtonGroup
                color="primary"
                value={startDate}
                exclusive
                onChange={handleStartDateChange}
                aria-label="Start Date"
                size="small"
              >
                {startDates.map((date) => (
                  <ToggleButton key={date.label} value={date.date} aria-label={date.label}>
                    {date.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            <FormGroup className={styles.chart_controller_switch}>
              <Tooltip
                enterDelay={1000}
                enterNextDelay={1000}
                arrow={true}
                title="The stringency index is a composite measure based on nine response indicators including school closures, workplace closures, and travel bans, rescaled to a value from 0 to 100">
                <FormControlLabel control={<Switch checked={showStringency} onChange={handleStringencyChange} />} label="Show stringency index" labelPlacement="start" />
              </Tooltip>
            </FormGroup>
          </div>
          <div className={styles.single_chart_section}>
            <h4>Patients</h4>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(patientsChart.data.datasets)
                  ? <ChartJS ref={patientsChartRef} type={patientsChart.type} data={patientsChart.data} options={patientsChart.options}/>
                  : <p className={styles.chart_no_data_text}>No data to display</p>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
              }
            </div>
          </div>
          <div className={styles.single_chart_section}>
            <h4>Admissions</h4>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(admissionsChart.data.datasets)
                  ? <ChartJS ref={admissionsChartRef} type={admissionsChart.type} data={admissionsChart.data} options={admissionsChart.options}/>
                  : <p className={styles.chart_no_data_text}>No data to display</p>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
              }
            </div>
          </div>
        </section>
        <section className={styles.sidebar}>
          <LatestData 
            latestData={latestData} 
            location={location} 
            locations={locations}
            key1="hosp_patients"
            label1="Hospital"
            key2="icu_patients"
            label2="ICU"
            changeLocation={changeLocation}
            user={user}
          />
        </section>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';
  const hospitalizationsData: IData[] = await getData(location, ['hosp_patients', 'icu_patients', 'weekly_hosp_admissions', 'weekly_icu_admissions', 'stringency_index'], defaultStartDate);
  const latestData: IData[] = await getLatestData(undefined, ['hosp_patients','icu_patients']);

  const {
    chartLabels,
    hospPatients,
    icuPatients,
    weeklyHospAdmissions,
    weeklyICUAdmissions,
    stringencyIndex
  } = prepareChartData(hospitalizationsData);

  return { props: {
    user: user,
    location: location,
    locations: locations,
    latestData: latestData,
    chartLabels: chartLabels,
    hospPatients: hospPatients,
    icuPatients: icuPatients,
    weeklyHospAdmissions: weeklyHospAdmissions,
    weeklyICUAdmissions: weeklyICUAdmissions,
    stringencyIndex: stringencyIndex
  } };
}

const prepareChartData = (data: IData[]) => {
  //Chart data arrays
  const chartLabels: string[] = [];
  const hospPatients: number[] = [];
  const icuPatients: number[] = [];
  const weeklyHospAdmissions: number[] = [];
  const weeklyICUAdmissions: number[] = [];
  const stringencyIndex: number[] = [];

  //Push data to arrays
  data.forEach((e, index) => {
    const date = moment(e.date).format('YYYY-MM-DD');
    chartLabels.push(date);

    //Patients chart
    hospPatients.push(e.hosp_patients ?? 0);
    icuPatients.push(e.icu_patients ?? 0);

    //Admissions chart
    weeklyHospAdmissions.push(e.weekly_hosp_admissions ?? 0);
    weeklyICUAdmissions.push(e.weekly_icu_admissions ?? 0);

    //Stringency index
    stringencyIndex.push(e.stringency_index ?? 0);
  });

  return {
    chartLabels,
    hospPatients,
    icuPatients,
    weeklyHospAdmissions,
    weeklyICUAdmissions,
    stringencyIndex,
  };
}

export default Hospitalizations
