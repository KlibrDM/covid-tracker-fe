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
import { fourteenDayAverage } from '../../utils/calculate-14-day-average';
import { CircularProgress, FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';
import moment from 'moment';
import _ from 'lodash';
import { CASES_CHART_OPTIONS, COMMON_CHART_OPTIONS } from '../../lib/chart-options';
import { DEATHS_COLOR, DEATHS_FILL_COLORS, DEFAULT_CHART_TYPES, DEFAULT_START_DATES, EXCESS_MORTALITY_COLOR, EXCESS_MORTALITY_FILL_COLORS, STRINGENCY_INDEX_COLOR, STRINGENCY_INDEX_FILL_COLORS } from '../../lib/constants';
import { IChartType } from '../../models/charts';
import { isChartEmpty } from '../../utils/isChartEmpty';
import { IUser } from '../../models/user';

Chart.register(CategoryScale);

const startDates = DEFAULT_START_DATES;
const chartTypes: IChartType[] = DEFAULT_CHART_TYPES;

const defaultStartDate = startDates[1].date;
const defaultChartType: IChartType = chartTypes[0];

const Deaths: NextPage = (props: any) => {
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
  const excessMortalityChartLabels: string[] = props.excessMortalityChartLabels;
  const newDeathsChartData: number[] = props.newDeathsChartData;
  const newDeathsAverage: number[] = props.newDeathsAverage;
  const [stringencyIndex, setStringencyIndex] = useState<number[]>(props.stringencyIndex);
  const totalDeathsChartData: number[] = props.totalDeathsChartData;
  const excessMortalityChartData: number[] = props.excessMortalityChartData;
  const excessMortalityCumulativeChartData: number[] = props.excessMortalityCumulativeChartData;
  
  //Build charts
  const newDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'New Deaths',
      data: newDeathsChartData,
      fill: DEATHS_FILL_COLORS,
      backgroundColor: DEATHS_COLOR,
      borderColor: DEATHS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 3,
    },
    {
      type: 'line',
      label: '14 day average',
      data: newDeathsAverage,
      backgroundColor: '#ff232b',
      borderColor: '#ff232b',
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
  const newDeathsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: newDeathsChartDatasets
    },
    options: CASES_CHART_OPTIONS(newDeathsChartDatasets)
  };

  const totalDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Total Deaths',
      data: totalDeathsChartData,
      fill: DEATHS_FILL_COLORS,
      backgroundColor: DEATHS_COLOR,
      borderColor: DEATHS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }
  ];
  const totalDeathsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: totalDeathsChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const excessMortalityChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Excess Mortality',
      data: excessMortalityChartData,
      fill: EXCESS_MORTALITY_FILL_COLORS,
      backgroundColor: EXCESS_MORTALITY_COLOR,
      borderColor: EXCESS_MORTALITY_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 2
    },
    {
      type: 'line',
      label: 'Ex. M. Cumulative',
      data: excessMortalityCumulativeChartData,
      backgroundColor: '#12b3eb',
      borderColor: '#12b3eb',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      order: 1,
    },
  ];
  const excessMortalityChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: excessMortalityChartLabels,
      datasets: excessMortalityChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const [newDeathsChart, setNewDeathsChart] = useState(newDeathsChartConfiguration);
  const [totalDeathsChart, setTotalDeathsChart] = useState(totalDeathsChartConfiguration);
  const [excessMortalityChart, setExcessMortalityChart] = useState(excessMortalityChartConfiguration);

  const newDeathsChartRef = useRef(null);
  const totalDeathsChartRef = useRef(null);
  const excessMortalityChartRef = useRef(null);

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
      getData(location, ['new_deaths', 'total_deaths', 'stringency_index', 'excess_mortality', 'excess_mortality_cumulative'], queryStartDate, undefined, isCustomLocation).then((data: IData[]) => {
        const {
          chartLabels,
          excessMortalityChartLabels,
          newDeathsChartData,
          newDeathsAverage,
          stringencyIndex,
          totalDeathsChartData,
          excessMortalityChartData,
          excessMortalityCumulativeChartData
        } = prepareChartData(data);

        //Set data
        newDeathsChart.data.datasets[0].data = newDeathsChartData;
        newDeathsChart.data.datasets[1].data = newDeathsAverage;
        newDeathsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        newDeathsChart.data.labels = chartLabels;

        totalDeathsChart.data.datasets[0].data = totalDeathsChartData;
        totalDeathsChart.data.labels = chartLabels;

        excessMortalityChart.data.datasets[0].data = excessMortalityChartData;
        excessMortalityChart.data.datasets[1].data = excessMortalityCumulativeChartData;
        excessMortalityChart.data.labels = excessMortalityChartLabels;

        setStringencyIndex(stringencyIndex);

        setNewDeathsChart(_.cloneDeep(newDeathsChart));
        setTotalDeathsChart(_.cloneDeep(totalDeathsChart));
        setExcessMortalityChart(_.cloneDeep(excessMortalityChart));

        setStartDate(newStartDate);
      });

      //Reset chart zoom
      if (newDeathsChartRef && newDeathsChartRef.current) {
        //@ts-ignore
        newDeathsChartRef.current.resetZoom();
      }
      if (totalDeathsChartRef && totalDeathsChartRef.current) {
        //@ts-ignore
        totalDeathsChartRef.current.resetZoom();
      }
      if (excessMortalityChartRef && excessMortalityChartRef.current) {
        //@ts-ignore
        excessMortalityChartRef.current.resetZoom();
      }
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
    if (newChartType) {
      const chartType = chartTypes.find(e => e.value === newChartType);

      if(chartType){
        chartType.fill = DEATHS_FILL_COLORS;

        newDeathsChart.type = chartType.type;
        setUnsetArea(newDeathsChart, chartType);
        setNewDeathsChart(_.cloneDeep(newDeathsChart));

        totalDeathsChart.type = chartType.type;
        setUnsetArea(totalDeathsChart, chartType);
        setTotalDeathsChart(_.cloneDeep(totalDeathsChart));

        chartType.fill = EXCESS_MORTALITY_FILL_COLORS;
        excessMortalityChart.type = chartType.type;
        setUnsetArea(excessMortalityChart, chartType);
        setExcessMortalityChart(_.cloneDeep(excessMortalityChart));
        
        setChartType(chartType.value);
      }
    }
  }

  const handleStringencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if(checked){
      newDeathsChart.data.datasets[2].data = stringencyIndex;
    }
    else{
      newDeathsChart.data.datasets[2].data = [];
    }
    setNewDeathsChart(_.cloneDeep(newDeathsChart));
    setShowStringency(checked);
  }

  const setUnsetArea = (chart: ChartConfiguration, chartType: IChartType) => {
    if(chartType.value === 'area'){
      chart.data.datasets.forEach(dataset => {
        if(!dataset.type){
          //@ts-ignore
          dataset.fill = chartType.fill;
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
      getData(newLocation, ['new_deaths', 'total_deaths', 'stringency_index', 'excess_mortality', 'excess_mortality_cumulative'], queryStartDate, undefined, isCustom).then((data: IData[]) => {
        const {
          chartLabels,
          excessMortalityChartLabels,
          newDeathsChartData,
          newDeathsAverage,
          stringencyIndex,
          totalDeathsChartData,
          excessMortalityChartData,
          excessMortalityCumulativeChartData
        } = prepareChartData(data);

        //Set data
        newDeathsChart.data.datasets[0].data = newDeathsChartData;
        newDeathsChart.data.datasets[1].data = newDeathsAverage;
        newDeathsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        newDeathsChart.data.labels = chartLabels;

        totalDeathsChart.data.datasets[0].data = totalDeathsChartData;
        totalDeathsChart.data.labels = chartLabels;

        excessMortalityChart.data.datasets[0].data = excessMortalityChartData;
        excessMortalityChart.data.datasets[1].data = excessMortalityCumulativeChartData;
        excessMortalityChart.data.labels = excessMortalityChartLabels;

        setStringencyIndex(stringencyIndex);

        setNewDeathsChart(_.cloneDeep(newDeathsChart));
        setTotalDeathsChart(_.cloneDeep(totalDeathsChart));
        setExcessMortalityChart(_.cloneDeep(excessMortalityChart));

        setLocation(newLocation);
      });
    }
  }

  return (
    <Layout>
      <Head>
        <title>Deaths</title>
        <meta name="description" content="CovidTracker Deaths" />
      </Head>

      <section className={styles.page_container}>
        <section className={styles.charts_section}>
          <div className={styles.page_details}>
            <h1 className={styles.page_title}>Covid-19 Deaths in {locationName}</h1>
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
            <h4>New Deaths</h4>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(newDeathsChart.data.datasets)
                  ? <ChartJS ref={newDeathsChartRef} type={newDeathsChart.type} data={newDeathsChart.data} options={newDeathsChart.options}/>
                  : <p className={styles.chart_no_data_text}>No data to display</p>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
              }
            </div>
          </div>
          <div className={styles.multi_charts_section}>
            <div className={styles.single_chart_section}>
              <p>Total</p>
              <div className={styles.chart_container}>
                {
                  chartReady
                  ? !isChartEmpty(totalDeathsChart.data.datasets)
                    ? <ChartJS ref={totalDeathsChartRef} type={totalDeathsChart.type} data={totalDeathsChart.data} options={totalDeathsChart.options}/>
                    : <p className={styles.chart_no_data_text}>No data to display</p>
                  : <div className={styles.spinner_container}>
                      <CircularProgress />
                    </div>
                }
              </div>
            </div>
            <div className={styles.single_chart_section}>
              <p>Excess Mortality</p>
              <div className={styles.chart_container}>
                {
                  chartReady
                  ? !isChartEmpty(excessMortalityChart.data.datasets)
                    ? <ChartJS ref={excessMortalityChartRef} type={excessMortalityChart.type} data={excessMortalityChart.data} options={excessMortalityChart.options}/>
                    : <p className={styles.chart_no_data_text}>No data to display</p>
                  : <div className={styles.spinner_container}>
                      <CircularProgress />
                    </div>
                }
              </div>
            </div>
          </div>
        </section>
        <section className={styles.sidebar}>
          <LatestData 
            latestData={latestData} 
            location={location} 
            locations={locations}
            key1="total_deaths"
            label1="Total deaths"
            key2="new_deaths"
            label2="New deaths"
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
  const deathsData: IData[] = await getData(location, ['new_deaths', 'total_deaths', 'stringency_index', 'excess_mortality', 'excess_mortality_cumulative'], defaultStartDate);
  const latestData: IData[] = await getLatestData(undefined, ['new_deaths','total_deaths']);

  const {
    chartLabels,
    excessMortalityChartLabels,
    newDeathsChartData,
    newDeathsAverage,
    stringencyIndex,
    totalDeathsChartData,
    excessMortalityChartData,
    excessMortalityCumulativeChartData
  } = prepareChartData(deathsData);

  return { props: {
    user: user,
    location: location,
    locations: locations,
    latestData: latestData,
    chartLabels: chartLabels,
    excessMortalityChartLabels: excessMortalityChartLabels,
    newDeathsChartData: newDeathsChartData,
    newDeathsAverage: newDeathsAverage,
    stringencyIndex: stringencyIndex,
    totalDeathsChartData: totalDeathsChartData,
    excessMortalityChartData: excessMortalityChartData,
    excessMortalityCumulativeChartData: excessMortalityCumulativeChartData
  } };
}

const prepareChartData = (data: IData[]) => {
  //Chart data arrays
  const chartLabels: string[] = [];
  const excessMortalityChartLabels: string[] = [];
  const newDeathsChartData: number[] = [];
  const newDeathsAverage: number[] = [];
  const stringencyIndex: number[] = [];
  const totalDeathsChartData: number[] = [];
  const excessMortalityChartData: number[] = [];
  const excessMortalityCumulativeChartData: number[] = [];

  //Push data to arrays
  data.forEach(e => {
    const date = moment(e.date).format('YYYY-MM-DD');
    chartLabels.push(date);

    //New deaths chart
    newDeathsChartData.push(e.new_deaths ?? 0);
    stringencyIndex.push(e.stringency_index ?? 0);

    //Total deaths chart
    totalDeathsChartData.push(e.total_deaths ?? 0);

    //Excess mortality chart
    if(e.excess_mortality !== undefined) {
      excessMortalityChartData.push(e.excess_mortality);
      excessMortalityChartLabels.push(date);
    }
    if(e.excess_mortality_cumulative !== undefined) {
      excessMortalityCumulativeChartData.push(e.excess_mortality_cumulative);
    }
  });

  //Create 14 day average
  newDeathsAverage.push(...fourteenDayAverage(newDeathsChartData));

  return {
    chartLabels,
    excessMortalityChartLabels,
    newDeathsChartData,
    newDeathsAverage,
    stringencyIndex,
    totalDeathsChartData,
    excessMortalityChartData,
    excessMortalityCumulativeChartData
  };
}

export default Deaths
