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
import { CASES_CHART_OPTIONS, COMMON_CHART_OPTIONS, COMMON_PERCENTAGE_CHART_OPTIONS } from '../../lib/chart-options';
import { DEFAULT_CHART_TYPES, DEFAULT_START_DATES, STRINGENCY_INDEX_COLOR, STRINGENCY_INDEX_FILL_COLORS, TESTS_COLOR, TESTS_FILL_COLORS } from '../../lib/constants';
import { IChartType } from '../../models/charts';
import { isChartEmpty } from '../../utils/isChartEmpty';
import { IUser } from '../../models/user';

Chart.register(CategoryScale);

const startDates = DEFAULT_START_DATES;
const chartTypes: IChartType[] = DEFAULT_CHART_TYPES;

const defaultStartDate = startDates[1].date;
const defaultChartType: IChartType = chartTypes[0];

const Testing: NextPage = (props: any) => {
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
  const newTestsChartData: number[] = props.newTestsChartData;
  const newTestsAverage: number[] = props.newTestsAverage;
  const [stringencyIndex, setStringencyIndex] = useState<number[]>(props.stringencyIndex);
  const totalTestsChartData: number[] = props.totalTestsChartData;
  const positivityChartData: number[] = props.positivityChartData;
  
  const [testUnits, setTestUnits] = useState(props.testUnits);
  
  //Build charts
  const newTestsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'New Tests',
      data: newTestsChartData,
      fill: TESTS_FILL_COLORS,
      backgroundColor: TESTS_COLOR,
      borderColor: TESTS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 3,
    },
    {
      type: 'line',
      label: '14 day average',
      data: newTestsAverage,
      backgroundColor: '#12b3eb',
      borderColor: '#12b3eb',
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
  const newTestsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: newTestsChartDatasets
    },
    options: CASES_CHART_OPTIONS(newTestsChartDatasets)
  };

  const totalTestsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Total Tests',
      data: totalTestsChartData,
      fill: TESTS_FILL_COLORS,
      backgroundColor: TESTS_COLOR,
      borderColor: TESTS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }
  ];
  const totalTestsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: totalTestsChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const positivityChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Positivity Rate',
      data: positivityChartData,
      fill: TESTS_FILL_COLORS,
      backgroundColor: TESTS_COLOR,
      borderColor: TESTS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }
  ];
  const positivityChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: positivityChartDatasets
    },
    options: COMMON_PERCENTAGE_CHART_OPTIONS
  };

  const [newTestsChart, setNewTestsChart] = useState(newTestsChartConfiguration);
  const [totalTestsChart, setTotalTestsChart] = useState(totalTestsChartConfiguration);
  const [positivityChart, setPositivityChart] = useState(positivityChartConfiguration);

  const newTestsChartRef = useRef(null);
  const totalTestsChartRef = useRef(null);
  const positivityChartRef = useRef(null);

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
      getData(location, ['new_tests', 'total_tests', 'positive_rate', 'test_units', 'stringency_index'], queryStartDate, undefined, isCustomLocation).then((data: IData[]) => {
        const {
          chartLabels,
          newTestsChartData,
          newTestsAverage,
          stringencyIndex,
          totalTestsChartData,
          positivityChartData,
          testUnits
        } = prepareChartData(data);

        //Set data
        newTestsChart.data.datasets[0].data = newTestsChartData;
        newTestsChart.data.datasets[1].data = newTestsAverage;
        newTestsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        newTestsChart.data.labels = chartLabels;

        totalTestsChart.data.datasets[0].data = totalTestsChartData;
        totalTestsChart.data.labels = chartLabels;

        positivityChart.data.datasets[0].data = positivityChartData;
        positivityChart.data.labels = chartLabels;

        setTestUnits(testUnits);

        setStringencyIndex(stringencyIndex);

        setNewTestsChart(_.cloneDeep(newTestsChart));
        setTotalTestsChart(_.cloneDeep(totalTestsChart));
        setPositivityChart(_.cloneDeep(positivityChart));

        setStartDate(newStartDate);
      });

      //Reset chart zoom
      if (newTestsChartRef && newTestsChartRef.current) {
        //@ts-ignore
        newTestsChartRef.current.resetZoom();
      }
      if (totalTestsChartRef && totalTestsChartRef.current) {
        //@ts-ignore
        totalTestsChartRef.current.resetZoom();
      }
      if (positivityChartRef && positivityChartRef.current) {
        //@ts-ignore
        positivityChartRef.current.resetZoom();
      }
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
    if (newChartType) {
      const chartType = chartTypes.find(e => e.value === newChartType);

      if(chartType){
        chartType.fill = TESTS_FILL_COLORS;

        newTestsChart.type = chartType.type;
        setUnsetArea(newTestsChart, chartType);
        setNewTestsChart(_.cloneDeep(newTestsChart));

        totalTestsChart.type = chartType.type;
        setUnsetArea(totalTestsChart, chartType);
        setTotalTestsChart(_.cloneDeep(totalTestsChart));

        positivityChart.type = chartType.type;
        setUnsetArea(positivityChart, chartType);
        setPositivityChart(_.cloneDeep(positivityChart));
        
        setChartType(chartType.value);
      }
    }
  }

  const handleStringencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if(checked){
      newTestsChart.data.datasets[2].data = stringencyIndex;
    }
    else{
      newTestsChart.data.datasets[2].data = [];
    }
    setNewTestsChart(_.cloneDeep(newTestsChart));
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
      getData(newLocation, ['new_tests', 'total_tests', 'positive_rate', 'test_units', 'stringency_index'], queryStartDate, undefined, isCustom).then((data: IData[]) => {
        const {
          chartLabels,
          newTestsChartData,
          newTestsAverage,
          stringencyIndex,
          totalTestsChartData,
          positivityChartData,
          testUnits
        } = prepareChartData(data);

        //Set data
        newTestsChart.data.datasets[0].data = newTestsChartData;
        newTestsChart.data.datasets[1].data = newTestsAverage;
        newTestsChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        newTestsChart.data.labels = chartLabels;

        totalTestsChart.data.datasets[0].data = totalTestsChartData;
        totalTestsChart.data.labels = chartLabels;

        positivityChart.data.datasets[0].data = positivityChartData;
        positivityChart.data.labels = chartLabels;

        setTestUnits(testUnits);

        setStringencyIndex(stringencyIndex);

        setNewTestsChart(_.cloneDeep(newTestsChart));
        setTotalTestsChart(_.cloneDeep(totalTestsChart));
        setPositivityChart(_.cloneDeep(positivityChart));

        setLocation(newLocation);
      });
    }
  }

  return (
    <Layout>
      <Head>
        <title>Testing</title>
        <meta name="description" content="CovidTracker Testing" />
      </Head>

      <section className={styles.page_container}>
        <section className={styles.charts_section}>
          <div className={styles.page_details}>
            <h1 className={styles.page_title}>Covid-19 Testing in {locationName}</h1>
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
            <h4>New Tests {testUnits.length ? `(Unit: ${testUnits})` : null}</h4>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(newTestsChart.data.datasets)
                  ? <ChartJS ref={newTestsChartRef} type={newTestsChart.type} data={newTestsChart.data} options={newTestsChart.options}/>
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
                  ? !isChartEmpty(totalTestsChart.data.datasets)
                    ? <ChartJS ref={totalTestsChartRef} type={totalTestsChart.type} data={totalTestsChart.data} options={totalTestsChart.options}/>
                    : <p className={styles.chart_no_data_text}>No data to display</p>
                  : <div className={styles.spinner_container}>
                      <CircularProgress />
                    </div>
                }
              </div>
            </div>
            <div className={styles.single_chart_section}>
              <p>Positivity Rate</p>
              <div className={styles.chart_container}>
                {
                  chartReady
                  ? !isChartEmpty(positivityChart.data.datasets)
                    ? <ChartJS ref={positivityChartRef} type={positivityChart.type} data={positivityChart.data} options={positivityChart.options}/>
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
            key1="total_tests"
            label1="Total tests"
            key2="new_tests"
            label2="New tests"
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
  const testsData: IData[] = await getData(location, ['new_tests', 'total_tests', 'positive_rate', 'test_units', 'stringency_index'], defaultStartDate);
  const latestData: IData[] = await getLatestData(undefined, ['new_tests','total_tests']);

  const {
    chartLabels,
    newTestsChartData,
    newTestsAverage,
    stringencyIndex,
    totalTestsChartData,
    positivityChartData,
    testUnits
  } = prepareChartData(testsData);

  return { props: {
    user: user,
    location: location,
    locations: locations,
    latestData: latestData,
    chartLabels: chartLabels,
    newTestsChartData: newTestsChartData,
    newTestsAverage: newTestsAverage,
    stringencyIndex: stringencyIndex,
    totalTestsChartData: totalTestsChartData,
    positivityChartData: positivityChartData,
    testUnits: testUnits
  } };
}

const prepareChartData = (data: IData[]) => {
  //Chart data arrays
  const chartLabels: string[] = [];
  const newTestsChartData: number[] = [];
  const newTestsAverage: number[] = [];
  const stringencyIndex: number[] = [];
  const totalTestsChartData: number[] = [];
  const positivityChartData: number[] = [];
  const testUnits: string = data.find((e) => e.test_units)?.test_units ?? '';

  //Push data to arrays
  data.forEach((e, index) => {
    const date = moment(e.date).format('YYYY-MM-DD');
    chartLabels.push(date);

    //New tests chart
    newTestsChartData.push(e.new_tests ?? 0);
    stringencyIndex.push(e.stringency_index ?? 0);

    //Total tests chart
    totalTestsChartData.push(e.total_tests ?? 0);

    //Positivity chart
    positivityChartData.push(e.positive_rate ? e.positive_rate * 100 : 0);
  });

  //Create 14 day average
  newTestsAverage.push(...fourteenDayAverage(newTestsChartData));

  return {
    chartLabels,
    newTestsChartData,
    newTestsAverage,
    stringencyIndex,
    totalTestsChartData,
    positivityChartData,
    testUnits
  };
}

export default Testing
