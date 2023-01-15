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
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RunDialog from './components/run-dialog';
import { ISimulation, ISimulationQuery, ISimulationResultSummary } from '../../models/simulation';
import { deleteSimulation, getSimulation, getSimulationsPersonal, getSimulationsPublic, runSimulation, saveSimulation, updateSimulation } from '../../lib/simulation.service';
import moment from 'moment';
import { SIM_CHART_OPTIONS } from '../../lib/chart-options';
import { CASES_COLOR, CASES_FILL_COLORS, DEATHS_COLOR, DEATHS_FILL_COLORS, HOSPITAL_COLOR, HOSPITAL_FILL_COLORS, ICU_COLOR, ICU_FILL_COLORS, MAX_RESULTS_LIMIT, RESULTS_LIMIT } from '../../lib/constants';
import { isChartEmpty } from '../../utils/isChartEmpty';
import { Card, CardContent, CircularProgress, IconButton } from '@mui/material';
import { SIMULATION_DATASETS } from '../../lib/simulation-datasets';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useRouter } from 'next/router';
import { IData } from '../../models/data';
import { getData } from '../../lib/data.service';
import { fourteenDayAverage } from '../../utils/calculate-14-day-average';
import { sevenDayTotal } from '../../utils/calculate-7-day-total';
import annotationPlugin from 'chartjs-plugin-annotation';
import DialogContentText from '@mui/material/DialogContentText';

Chart.register(CategoryScale);
Chart.register(annotationPlugin);

const Simulation: NextPage = (props: any) => {
  const router = useRouter();
  const { id } = router.query;
  const loadId = id as string;

  const user = props.user || {};
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [publicSims, setPublicSims] = useState<(ISimulation & { _id: string })[]>([]);
  const [personalSims, setPersonalSims] = useState<(ISimulation & { _id: string })[]>([]);

  const [isRunDialogOpen, setIsRunDialogOpen] = useState<boolean>(false);
  const runDialogRef = useRef(null);

  const [chartReady, setChartReady] = useState<boolean>(false);
  const [simData, setSimData] = useState<(ISimulation & { _id?: string })>();
  const [simSummary, setSimSummary] = useState<ISimulationResultSummary>();
  const [simName, setSimName] = useState<string>("New simulation");
  const [simIsPublic, setSimIsPublic] = useState<boolean>(false);
  const [simIsSaved, setSimIsSaved] = useState<boolean>(true);
  const [newCasesChart, setNewCasesChart] = useState<ChartConfiguration>();
  const [totalCasesChart, setTotalCasesChart] = useState<ChartConfiguration>();
  const [newDeathsChart, setNewDeathsChart] = useState<ChartConfiguration>();
  const [totalDeathsChart, setTotalDeathsChart] = useState<ChartConfiguration>();
  const [icuPatientsChart, setIcuPatientsChart] = useState<ChartConfiguration>();
  const [hospPatientsChart, setHospPatientsChart] = useState<ChartConfiguration>();

  const newCasesChartRef = useRef(null);
  const totalCasesChartRef = useRef(null);
  const newDeathsChartRef = useRef(null);
  const totalDeathsChartRef = useRef(null);
  const icuPatientsChartRef = useRef(null);
  const hospPatientsChartRef = useRef(null);

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
      ownerId: user._id,
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

    setSimIsSaved(false);
    setIsRunDialogOpen(false);
    //@ts-ignore
    runDialogRef.current.updateDialogState(false);
  };

  const handleSave = async () => {
    simData!.name = simName;
    simData!.is_public = simIsPublic;

    await saveSimulation(simData!, user.token).then(res => {
      setSimIsSaved(true);
      simData!._id = res._id;
    });
  };

  const handleModify = async () => {
    simData!.name = simName;
    simData!.is_public = simIsPublic;

    await updateSimulation(simData!, simData!._id!, user.token).then(res => {
      setSimIsSaved(true);
    });
  };

  const handleSimDelete = async (id: string) => {
    await deleteSimulation(id, user.token).then(res => {
      personalSims.splice(personalSims.findIndex(e => e._id === id), 1);
      setPersonalSims([...personalSims]);
      publicSims.splice(publicSims.findIndex(e => e._id === id), 1);
      setPublicSims([...publicSims]);
    });
  };

  const handleSimClose = async () => {
    setSimData(undefined);
    getSims();
  }

  const loadCharts = async (data: ISimulation) => {
    const chartLabels = data.new_cases.map((e, i) => moment(data.start_date).add(i, 'days').format('YYYY-MM-DD'));
    
    //Add to chart labels past dates
    let pastDateCurrent = moment(data.start_date).subtract(1, 'day');
    const pastDateEndDate = moment(data.start_date).subtract(61, 'days');
    while (pastDateCurrent.isAfter(pastDateEndDate)) {
      chartLabels.unshift(pastDateCurrent.format('YYYY-MM-DD'));
      pastDateCurrent.subtract(1, 'day');
    }

    const {
      past_new_cases,
      past_new_deaths,
      past_total_cases,
      past_total_deaths,
      past_hosp_patients,
      past_icu_patients
    } = await getPastData(data.start_date, data.location_code);

    const newCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'New Cases',
        data: [...past_new_cases, ...data.new_cases],
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
      options: SIM_CHART_OPTIONS
    };
    setNewCasesChart(newCasesChartConfiguration);

    const totalCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'Total Cases',
        data: [...past_total_cases, ...data.total_cases],
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
      options: SIM_CHART_OPTIONS
    };
    setTotalCasesChart(totalCasesChartConfiguration);

    const newDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'New Deaths',
        data: [...past_new_deaths, ...data.new_deaths],
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
      options: SIM_CHART_OPTIONS
    };
    setNewDeathsChart(newDeathsChartConfiguration);

    const totalDeathsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'Total Deaths',
        data: [...past_total_deaths, ...data.total_deaths],
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
      options: SIM_CHART_OPTIONS
    };
    setTotalDeathsChart(totalDeathsChartConfiguration);

    const icuPatientsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'ICU Admissions',
        data: [...past_icu_patients, ...sevenDayTotal(data.icu_patients)],
        fill: ICU_FILL_COLORS,
        backgroundColor: ICU_COLOR,
        borderColor: ICU_COLOR,
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1
      }
    ];
    const icuPatientsChartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: icuPatientsChartDatasets
      },
      options: SIM_CHART_OPTIONS
    };
    setIcuPatientsChart(icuPatientsChartConfiguration);

    const hospPatientsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
      {
        label: 'Hospital Admissions',
        data: [...past_hosp_patients, ...sevenDayTotal(data.hosp_patients)],
        fill: HOSPITAL_FILL_COLORS,
        backgroundColor: HOSPITAL_COLOR,
        borderColor: HOSPITAL_COLOR,
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1
      }
    ];
    const hospPatientsChartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: hospPatientsChartDatasets
      },
      options: SIM_CHART_OPTIONS
    };
    setHospPatientsChart(hospPatientsChartConfiguration);

    setSimData(data);
    setSimName(data.name);
    setSimIsPublic(data.is_public);
    setSimSummary({
      total_new_cases: data.new_cases.reduce((a, b) => a + b, 0),
      total_new_deaths: data.new_deaths.reduce((a, b) => a + b, 0),
      peak_new_cases: data.new_cases.length ? Math.max(...data.new_cases) : 0,
      peak_new_deaths: data.new_deaths.length ? Math.max(...data.new_deaths) : 0,
      peak_icu_patients: data.icu_patients.length ? Math.max(...data.icu_patients) : 0,
      peak_hosp_patients: data.hosp_patients.length ? Math.max(...data.hosp_patients) : 0,
    });
  }

  const getPastData = async (startDate: Date, location: string) => {
    const pastData: IData[] = await getData(location, ['new_cases', 'total_cases', 'new_deaths', 'total_deaths', 'icu_patients', 'hosp_patients'], moment(startDate).subtract(3, 'months').format('YYYY-MM-DD'));
    const past_new_cases = fourteenDayAverage(pastData.map(e => e.new_cases || 0)).slice(-60);
    const past_new_deaths = fourteenDayAverage(pastData.map(e => e.new_deaths || 0)).slice(-60);
    const past_total_cases = pastData.map(e => e.total_cases || 0).slice(-60);
    const past_total_deaths = pastData.map(e => e.total_deaths || 0).slice(-60);
    const past_icu_patients = pastData.map(e => e.icu_patients || 0).slice(-60);
    const past_hosp_patients = pastData.map(e => e.hosp_patients || 0).slice(-60);

    return {
      past_new_cases,
      past_total_cases,
      past_new_deaths,
      past_total_deaths,
      past_icu_patients,
      past_hosp_patients,
    }
  }

  useEffect(() => {
    async function loadZoom() {
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      Chart.register(zoomPlugin);
      setChartReady(true);
    } loadZoom();
  }, []);

  const getSims = async () => {
    const resPersonal = user.token ? await getSimulationsPersonal(user.token, MAX_RESULTS_LIMIT) : [];
    const resPublic = await getSimulationsPublic(RESULTS_LIMIT);

    setPersonalSims(resPersonal);
    setPublicSims(resPublic);
  };

  useEffect(() => {
    if (!loadId) {
      getSims();
    }
    else {
      getSimulation(loadId, user.token || '').then(res => {
        if (res && !res.message) {
          loadCharts(res);
        }
        else {
          getSims();
        }
      }, err => {
        getSims();
      });
    }
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
            <div className={styles.sim_cards_container}>
              {
                publicSims.length > 0 &&
                <div className={styles.sim_card_full_container}>
                  <h2>Public simulations</h2>
                  <div className={styles.sim_card_container}>
                    {publicSims.map((sim, i) => (
                      <Card
                        key={i}
                        className={styles.sim_card}
                        onClick={() => { setSimIsSaved(true); loadCharts(sim); }}
                      >
                        <CardContent className={styles.sim_card_content}>
                          <h4>{sim.name}</h4>
                          <p>Location: {locations.find(e => e.code === sim.location_code)?.name || sim.location_code}</p>
                          <p>{sim.simulation_parameters.find(e => e.key === 'simulation_days')
                              ? sim.simulation_parameters.find(e => e.key === 'simulation_days')?.value + ' days from ' + moment(sim.start_date).format('YYYY-MM-DD')
                              : 'Starting from ' + moment(sim.start_date).format('YYYY-MM-DD')
                          }</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              }
              {
                personalSims.length > 0 &&
                <div className={styles.sim_card_full_container}>
                  <h2>Personal simulations</h2>
                  <div className={styles.sim_card_container}>
                    {personalSims.map((sim, i) => (
                      <Card
                        key={i}
                        className={styles.sim_card}
                        onClick={() => { setSimIsSaved(true); loadCharts(sim) }}
                      >
                        <CardContent className={styles.sim_card_content}>
                          <h4>{sim.name}</h4>
                          <p>Location: {locations.find(e => e.code === sim.location_code)?.name || sim.location_code}</p>
                          <p>{sim.simulation_parameters.find(e => e.key === 'simulation_days')
                              ? sim.simulation_parameters.find(e => e.key === 'simulation_days')?.value + ' days from ' + moment(sim.start_date).format('YYYY-MM-DD')
                              : 'Starting from ' + moment(sim.start_date).format('YYYY-MM-DD')
                          }</p>
                        </CardContent>
                        <div className={styles.sim_card_actions}>
                          <IconButton
                            size='small'
                            onClick={event => {
                              event.stopPropagation();
                              handleSimDelete(sim._id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              }
            </div>
          </>
          :
          <>
            <h2>Simulation for {locations.find(e => e.code === simData.location_code)?.name}</h2>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <TextField
                fullWidth
                label="Simulation Name"
                variant="standard"
                size='small'
                inputProps={{ maxLength: 120 }}
                value={simName}
                onChange={(e) => {
                  setSimName(e.target.value);
                  setSimIsSaved(false);
                }}
                sx={{ marginBottom: 1 }}
              />
              <FormGroup>
                <FormControlLabel control={
                  <Switch checked={simIsPublic} onChange={(e) => {
                    setSimIsPublic(e.target.checked);
                    setSimIsSaved(false);
                  }} />
                } label="Public" labelPlacement="start" />
              </FormGroup>
            </div>
            <div style={{display: 'flex', gap: 10}}>
              {
                simData._id && user._id && simData.ownerId === user._id &&
                <Button
                  size="small"
                  variant="outlined"
                  color='success'
                  endIcon={<AutoFixHighIcon />}
                  onClick={handleModify}
                  disabled={simIsSaved || simName === '' || !user}
                >
                  Modify simulation
                </Button>
              }
              {
                !simData._id && user._id && simData.ownerId === user._id &&
                <Button
                  size="small"
                  variant="outlined"
                  color='success'
                  endIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={simIsSaved || simName === '' || !user}
                >
                  Save simulation
                </Button>
              }
              <Button
                size="small"
                variant="outlined"
                endIcon={<AddIcon />}
                onClick={handleNewSimulationClickOpen}
              >
                Run new simulation
              </Button>
              <Button
                size="small"
                variant="outlined"
                color='error'
                endIcon={<CloseIcon />}
                onClick={handleSimClose}
              >
                Close simulation
              </Button>
            </div>

            <div>
              <h3>Summary</h3>
              <DialogContentText sx={{marginBlockStart: '0em', marginBlockEnd: '0.6em', fontSize: '0.8rem'}}>
                Totals and peaks during the simulation.
              </DialogContentText>
              <div className={styles.sim_summary_cards}>
                <Card className={styles.sim_summary_card}>
                  <CardContent className={styles.sim_summary_card_content}>
                    <h4>Total new cases: {simSummary?.total_new_cases || 0}</h4>
                  </CardContent>
                </Card>
                <Card className={styles.sim_summary_card}>
                  <CardContent className={styles.sim_summary_card_content}>
                    <h4>Peak new cases: {simSummary?.peak_new_cases || 0}</h4>
                  </CardContent>
                </Card>
                <Card className={styles.sim_summary_card}>
                  <CardContent className={styles.sim_summary_card_content}>
                    <h4>Peak hospital patients: {simSummary?.peak_hosp_patients || 0}</h4>
                  </CardContent>
                </Card>
                <Card className={styles.sim_summary_card}>
                  <CardContent className={styles.sim_summary_card_content}>
                    <h4>Total new deaths: {simSummary?.total_new_deaths || 0}</h4>
                  </CardContent>
                </Card>
                <Card className={styles.sim_summary_card}>
                  <CardContent className={styles.sim_summary_card_content}>
                    <h4>Peak new deaths: {simSummary?.peak_new_deaths || 0}</h4>
                  </CardContent>
                </Card>
                <Card className={styles.sim_summary_card}>
                  <CardContent className={styles.sim_summary_card_content}>
                    <h4>Peak ICU patients: {simSummary?.peak_icu_patients || 0}</h4>
                  </CardContent>
                </Card>
              </div>
            </div>

            <h3>Charts</h3>
            <DialogContentText sx={{marginBlockStart: '0em', marginBlockEnd: '0em', fontSize: '0.8rem'}}>
              Data before the red line is real, data after the red line is simulated.
            </DialogContentText>

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

            <div className={styles.multi_charts_section}>
              <div className={styles.single_chart_section}>
                <p>Estimated Hospital Admissions</p>
                <div className={styles.chart_container}>
                  {
                    chartReady
                    ? hospPatientsChart && !isChartEmpty(hospPatientsChart.data.datasets)
                      ? <ChartJS ref={hospPatientsChartRef} type={hospPatientsChart.type} data={hospPatientsChart.data} options={hospPatientsChart.options}/>
                      : <p className={styles.chart_no_data_text}>No data to display</p>
                    : <div className={styles.spinner_container}>
                        <CircularProgress />
                      </div>
                  }
                </div>
              </div>
              <div className={styles.single_chart_section}>
                <p>Estimated ICU Admissions</p>
                <div className={styles.chart_container}>
                  {
                    chartReady
                    ? icuPatientsChart && !isChartEmpty(icuPatientsChart.data.datasets)
                      ? <ChartJS ref={icuPatientsChartRef} type={icuPatientsChart.type} data={icuPatientsChart.data} options={icuPatientsChart.options}/>
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
