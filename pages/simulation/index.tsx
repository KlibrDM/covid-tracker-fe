import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../shared-components/layout'
import styles from '../../styles/Simulation.module.css'
import { useRef, useState, useEffect } from 'react';
import { loadLocations } from '../../lib/location.service';
import { ILocation } from '../../models/location';
import { BubbleDataPoint, CategoryScale, ChartConfiguration, ChartDataset, ChartTypeRegistry, ScatterDataPoint } from "chart.js";
import { Chart as ChartJS } from "react-chartjs-2";
import Chart from "chart.js/auto";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RunDialog from './components/run-dialog';
import { ISimulation, ISimulationQuery } from '../../models/simulation';
import { runSimulation } from '../../lib/simulation.service';
import moment from 'moment';
import { COMMON_CHART_OPTIONS } from '../../lib/chart-options';
import { CASES_COLOR, CASES_FILL_COLORS, DEATHS_COLOR, DEATHS_FILL_COLORS } from '../../lib/constants';
import { isChartEmpty } from '../../utils/isChartEmpty';
import { CircularProgress } from '@mui/material';
import { SIMULATION_DATASETS } from '../../lib/simulation-datasets';

Chart.register(CategoryScale);

const Simulation: NextPage = (props: any) => {
  const user = props.user;
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [isRunDialogOpen, setIsRunDialogOpen] = useState<boolean>(false);
  const runDialogRef = useRef(null);

  const [chartReady, setChartReady] = useState<boolean>(false);
  const [simData, setSimData] = useState<ISimulation>();
  const [newCasesChart, setNewCasesChart] = useState<ChartConfiguration>();
  const [totalCasesChart, setTotalCasesChart] = useState<ChartConfiguration>();
  const [newDeathsChart, setNewDeathsChart] = useState<ChartConfiguration>();
  const [totalDeathsChart, setTotalDeathsChart] = useState<ChartConfiguration>();

  const newCasesChartRef = useRef(null);
  const totalCasesChartRef = useRef(null);
  const newDeathsChartRef = useRef(null);
  const totalDeathsChartRef = useRef(null);

  const handleNewSimulationClickOpen = () => {
    setIsRunDialogOpen(true);
    //@ts-ignore
    runDialogRef.current.updateDialogState(true);
  };

  const handleDialogClose = () => {
    setIsRunDialogOpen(false);
    //@ts-ignore
    runDialogRef.current.updateDialogState(false);
  };

  const handleDialogRun = async (data: any) => {
    const payload: ISimulationQuery = {
      ownerId: user.id,
      location_code: data.dialogLocation,
      start_date: new Date(),
      dataset_location_codes: SIMULATION_DATASETS.get(data.dialogDatasets) || [data.dialogLocation],
      simulation_parameters: [
        {
          key: "simulation_days",
          value: data.dialogSimulationDays
        }
      ],
    }

    await runSimulation(payload, user.token).then(res => {     
      loadCharts(res);
    });

    setIsRunDialogOpen(false);
    //@ts-ignore
    runDialogRef.current.updateDialogState(false);
  };

  const loadCharts = (data: ISimulation) => {
    const chartLabels = data.new_cases.map((e, i) => moment(data.start_date).add(i, 'days').format('YYYY-MM-DD'));
    
    const newCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'New Cases',
        data: data.new_cases,
        fill: CASES_FILL_COLORS,
        backgroundColor: CASES_COLOR,
        borderColor: CASES_COLOR,
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1
      }
    ];
    const newCasesChartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: newCasesChartDatasets
      },
      options: COMMON_CHART_OPTIONS
    };
    setNewCasesChart(newCasesChartConfiguration);

    const totalCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'Total Cases',
        data: data.total_cases,
        fill: CASES_FILL_COLORS,
        backgroundColor: CASES_COLOR,
        borderColor: CASES_COLOR,
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1
      }
    ];
    const totalCasesChartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: totalCasesChartDatasets
      },
      options: COMMON_CHART_OPTIONS
    };
    setTotalCasesChart(totalCasesChartConfiguration);

    const newDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'New Deaths',
        data: data.new_deaths,
        fill: DEATHS_FILL_COLORS,
        backgroundColor: DEATHS_COLOR,
        borderColor: DEATHS_COLOR,
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1
      }
    ];
    const newDeathsChartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: newDeathsChartDatasets
      },
      options: COMMON_CHART_OPTIONS
    };
    setNewDeathsChart(newDeathsChartConfiguration);

    const totalDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'Total Deaths',
        data: data.total_deaths,
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
    setTotalDeathsChart(totalDeathsChartConfiguration);

    setSimData(data);
  }

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
        <title>Simulation</title>
        <meta name="description" content="CovidTracker Simulation" />
      </Head>

      <section className={styles.page_container}>
        { !simData ?
          <>
            <h1>New simulation</h1>
            <div>
              <Button
                size="small"
                variant="outlined"
                endIcon={<AddIcon />}
                onClick={handleNewSimulationClickOpen}
              >
                Run new simulation
              </Button>
            </div>
          </>
          :
          <>
            <h1>{simData.name}</h1>
            <h2>{locations.find(e => e.code === simData.location_code)?.name}</h2>
            <div>
              <Button
                size="small"
                variant="outlined"
                endIcon={<AddIcon />}
                onClick={handleNewSimulationClickOpen}
              >
                Run new simulation
              </Button>
            </div>

            <div className={styles.multi_charts_section}>
              <div className={styles.single_chart_section}>
                <p>Estimated New Cases</p>
                <div className={styles.chart_container}>
                  {
                    chartReady
                    ? newCasesChart && !isChartEmpty(newCasesChart.data.datasets)
                      ? <ChartJS ref={newCasesChartRef} type={newCasesChart.type} data={newCasesChart.data} options={newCasesChart.options}/>
                      : <p className={styles.chart_no_data_text}>No data to display</p>
                    : <div className={styles.spinner_container}>
                        <CircularProgress />
                      </div>
                  }
                </div>
              </div>
              <div className={styles.single_chart_section}>
                <p>Estimated Total Cases</p>
                <div className={styles.chart_container}>
                  {
                    chartReady
                    ? totalCasesChart && !isChartEmpty(totalCasesChart.data.datasets)
                      ? <ChartJS ref={totalCasesChartRef} type={totalCasesChart.type} data={totalCasesChart.data} options={totalCasesChart.options}/>
                      : <p className={styles.chart_no_data_text}>No data to display</p>
                    : <div className={styles.spinner_container}>
                        <CircularProgress />
                      </div>
                  }
                </div>
              </div>
            </div>

            <div className={styles.multi_charts_section}>
              <div className={styles.single_chart_section}>
                <p>Estimated New Deaths</p>
                <div className={styles.chart_container}>
                  {
                    chartReady
                    ? newDeathsChart && !isChartEmpty(newDeathsChart.data.datasets)
                      ? <ChartJS ref={newDeathsChartRef} type={newDeathsChart.type} data={newDeathsChart.data} options={newDeathsChart.options}/>
                      : <p className={styles.chart_no_data_text}>No data to display</p>
                    : <div className={styles.spinner_container}>
                        <CircularProgress />
                      </div>
                  }
                </div>
              </div>
              <div className={styles.single_chart_section}>
                <p>Estimated Total Deaths</p>
                <div className={styles.chart_container}>
                  {
                    chartReady
                    ? totalDeathsChart && !isChartEmpty(totalDeathsChart.data.datasets)
                      ? <ChartJS ref={totalDeathsChartRef} type={totalDeathsChart.type} data={totalDeathsChart.data} options={totalDeathsChart.options}/>
                      : <p className={styles.chart_no_data_text}>No data to display</p>
                    : <div className={styles.spinner_container}>
                        <CircularProgress />
                      </div>
                  }
                </div>
              </div>
            </div>
          </>
        }
        
      </section>

      <RunDialog
        ref={runDialogRef}
        location={location}
        locations={locations}
        handleDialogClose={handleDialogClose}
        handleDialogRun={handleDialogRun}
        isDialogOpen={isRunDialogOpen}
      />
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

export default Simulation
