import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { loadLocations } from '../lib/location.service'
import { ILocation } from '../models/location'
import Layout from '../shared-components/layout'
import styles from '../styles/Home.module.css'
import Chart from "chart.js/auto";
import { BubbleDataPoint, CategoryScale, ChartConfiguration, ChartDataset, ChartTypeRegistry, ScatterDataPoint } from "chart.js";
import { Chart as ChartJS } from "react-chartjs-2";
import { ICustomLocation } from '../models/custom-location'
import { IChart } from '../models/custom-chart'
import { IReport } from '../models/report'
import { ISimulation } from '../models/simulation'
import { IData } from '../models/data'
import { getData } from '../lib/data.service'
import moment from 'moment';
import { CASES_COLOR, CASES_FILL_COLORS, DEATHS_COLOR, DEATHS_FILL_COLORS, HOME_RESULTS_LIMIT } from '../lib/constants'
import { HOME_CHART_OPTIONS } from '../lib/chart-options'
import { isChartEmpty } from '../utils/isChartEmpty'
import CircularProgress from '@mui/material/CircularProgress'
import Link from 'next/link'
import Divider from '@mui/material/Divider'
import { getCustomLocationsPersonal, getCustomLocationsPublic } from '../lib/custom-location.service'
import { getChartsPersonal, getChartsPublic } from '../lib/custom-chart.service'
import { getReportsPersonal, getReportsPublic } from '../lib/report.service'
import { getSimulationsPersonal, getSimulationsPublic } from '../lib/simulation.service'
import PersonalCard from '../shared-components/personal-card'
import { fourteenDayAverage } from '../utils/calculate-14-day-average'

Chart.register(CategoryScale);

const Home: NextPage = (props: any) => {
  const user = props.user || {};
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [chartReady, setChartReady] = useState<boolean>(false);

  //Chart data
  const chartLabels: string[] = props.chartLabels;
  const newCasesData: number[] = props.newCasesData;
  const newDeathsData: number[] = props.newDeathsData;
  const newCasesAverageWarning = props.newCasesAverage;
  const newDeathsAverageWarning = props.newDeathsAverage;
  const personalLocations: (ICustomLocation & {_id: string})[] = props.personalLocations;
  const publicLocations: (ICustomLocation & {_id: string})[] = props.publicLocations;
  const personalCharts: (IChart & {_id: string})[] = props.personalCharts;
  const publicCharts: (IChart & {_id: string})[] = props.publicCharts;
  const personalReports: (IReport & {_id: string})[] = props.personalReports;
  const publicReports: (IReport & {_id: string})[] = props.publicReports;
  const personalSimulations: (ISimulation & {_id: string})[] = props.personalSimulations;
  const publicSimulations: (ISimulation & {_id: string})[] = props.publicSimulations;

  //Build charts
    const newCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'New Cases',
      data: newCasesData,
      fill: CASES_FILL_COLORS,
      backgroundColor: CASES_COLOR,
      borderColor: CASES_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    },
  ];
  const newCasesChartConfiguration: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: newCasesChartDatasets
    },
    options: HOME_CHART_OPTIONS
  };

  const newDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'New Deaths',
      data: newDeathsData,
      fill: DEATHS_FILL_COLORS,
      backgroundColor: DEATHS_COLOR,
      borderColor: DEATHS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    },
  ];
  const newDeathsChartConfiguration: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: newDeathsChartDatasets
    },
    options: HOME_CHART_OPTIONS
  };

  const [newCasesChart, setNewCasesChart] = useState(newCasesChartConfiguration);
  const [newDeathsChart, setNewDeathsChart] = useState(newDeathsChartConfiguration);

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
        <title>Home</title>
        <meta name="description" content="CovidTracker Home" />
      </Head>

      <section className={styles.page_container}>
        <h1>Welcome<span style={{fontSize: '1rem', color: '#999', fontWeight: '600'}}>, you&apos;re seeing data for {locationName}</span></h1>
        <div className={styles.charts_section}>
          <div className={styles.chart_card}>
            <h3>New cases <span>{newCasesAverageWarning ? '(calculated average)' : ''}</span></h3>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(newCasesChart.data.datasets)
                  ? <ChartJS type={newCasesChart.type} data={newCasesChart.data} options={newCasesChart.options}/>
                  : <p className={styles.chart_no_data_text}>No data to display</p>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
              }
            </div>
            <Divider></Divider>
            <div className={styles.chart_see_more}>
              <Link href="/cases">See more</Link>
            </div>
          </div>
          <div className={styles.chart_card}>
            <h3>New deaths <span>{newDeathsAverageWarning ? '(calculated average)' : ''}</span></h3>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(newDeathsChart.data.datasets)
                  ? <ChartJS type={newDeathsChart.type} data={newDeathsChart.data} options={newDeathsChart.options}/>
                  : <p className={styles.chart_no_data_text}>No data to display</p>
                : <div className={styles.spinner_container}>
                    <CircularProgress />
                  </div>
              }
            </div>
            <Divider></Divider>
            <div className={styles.chart_see_more}>
              <Link href="/deaths">See more</Link>
            </div>
          </div>
        </div>
        <div className={styles.personals_section}>
          <div className={styles.personals_card}>
            <h3>Charts</h3>
            <PersonalCard
              user={user}
              link={"/builder"}
              public={publicCharts}
              personal={personalCharts}
            ></PersonalCard>
          </div>
          <div className={styles.personals_card}>
            <h3>Reports</h3>
            <PersonalCard
              user={user}
              link={"/report"}
              public={publicReports}
              personal={personalReports}
            ></PersonalCard>
          </div>
          <div className={styles.personals_card}>
            <h3>Simulations</h3>
            <PersonalCard
              user={user}
              link={"/simulation"}
              public={publicSimulations}
              personal={personalSimulations}
            ></PersonalCard>
          </div>
          <div className={styles.personals_card}>
            <h3>Locations</h3>
            <PersonalCard
              user={user}
              link={"/locations"}
              public={publicLocations}
              personal={personalLocations}
            ></PersonalCard>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  const chartData: IData[] = await getData(location, ['new_cases', 'new_deaths'], moment().subtract(1, 'month').format('YYYY-MM-DD'));
  const personalLocations = user && user.token ? await getCustomLocationsPersonal(user.token, HOME_RESULTS_LIMIT) : [];
  const publicLocations = await getCustomLocationsPublic(HOME_RESULTS_LIMIT);
  const personalCharts = user && user.token ? await getChartsPersonal(user.token, HOME_RESULTS_LIMIT) : [];
  const publicCharts = await getChartsPublic(HOME_RESULTS_LIMIT);
  const personalReports = user && user.token ? await getReportsPersonal(user.token, HOME_RESULTS_LIMIT) : [];
  const publicReports = await getReportsPublic(HOME_RESULTS_LIMIT);
  const personalSimulations = user && user.token ? await getSimulationsPersonal(user.token, HOME_RESULTS_LIMIT) : [];
  const publicSimulations = await getSimulationsPublic(HOME_RESULTS_LIMIT);

  const { chartLabels, newCasesData, newDeathsData, newCasesAverage, newDeathsAverage } = prepareChartData(chartData);

  return { props: {
    location,
    locations,
    user,
    chartLabels,
    newCasesData,
    newDeathsData,
    newCasesAverage,
    newDeathsAverage,
    personalLocations,
    publicLocations,
    personalCharts,
    publicCharts,
    personalReports,
    publicReports,
    personalSimulations,
    publicSimulations
  } };
}

const prepareChartData = (chartData: IData[]) => {
  //Chart data arrays
  const chartLabels: string[] = [];
  const newCasesData: number[] = [];
  const newDeathsData: number[] = [];

  let newCasesAverage = false;
  let newDeathsAverage = false;

  const daysToShow = 14;

  let newCases = chartData.map(e => e.new_cases ?? 0);
  let newDeaths = chartData.map(e => e.new_deaths ?? 0);

  if(newCases.filter(e => e !== 0).length < 15){
    newCases = fourteenDayAverage(newCases);
    newCasesAverage = true;
  }

  if(newDeaths.filter(e => e !== 0).length < 15){
    newDeaths = fourteenDayAverage(newDeaths);
    newDeathsAverage = true;
  }

  newCases = newCases.slice(-daysToShow);
  newDeaths = newDeaths.slice(-daysToShow);

  chartData.slice(-daysToShow).forEach((e, i) => {
    const date = moment(e.date).format('YYYY-MM-DD');
    chartLabels.push(date);

    newCasesData.push(newCases[i]);
    newDeathsData.push(newDeaths[i]);
  });

  return { chartLabels, newCasesData, newDeathsData, newCasesAverage, newDeathsAverage };
}

export default Home
