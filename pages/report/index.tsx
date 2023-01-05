import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../shared-components/layout'
import styles from '../../styles/Report.module.css'
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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import moment from 'moment';
import { COMMON_CHART_OPTIONS } from '../../lib/chart-options';
import { Card, CardContent, CircularProgress, IconButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { IReport, IReportChart } from '../../models/report';
import { deleteReport, getReportsPersonal, getReportsPublic, saveReport, updateReport } from '../../lib/report.service';
import AddDialog from './components/add-dialog';
import { IChart } from '../../models/custom-chart';
import { IData } from '../../models/data';
import { getData } from '../../lib/data.service';
import { getCustomLocation } from '../../lib/custom-location.service';
import { sevenDayAverage } from '../../utils/calculate-7-day-average';
import { fourteenDayAverage } from '../../utils/calculate-14-day-average';

Chart.register(CategoryScale);

const Report: NextPage = (props: any) => {
  const user = props.user || {};
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [publicReports, setPublicReports] = useState<(IReport & { _id: string })[]>([]);
  const [personalReports, setPersonalReports] = useState<(IReport & { _id: string })[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const addDialogRef = useRef(null);

  const [chartReady, setChartReady] = useState<boolean>(false);
  const [reportData, setReportData] = useState<(IReport & { _id?: string })>();
  const [reportName, setReportName] = useState<string>("New report");
  const [reportIsPublic, setReportIsPublic] = useState<boolean>(false);
  const [reportIsSaved, setReportIsSaved] = useState<boolean>(true);

  const [charts, setCharts] = useState<IReportChart[]>([]);
  const [chartsDataReady, setChartsDataReady] = useState<boolean>(false);

  const handleNewReportClickOpen = () => {
    setReportData({
      ownerId: user._id || undefined,
      name: "New report",
      is_public: false,
      charts: [],
    });
    setReportName("New report");
    setReportIsPublic(false);
    setReportIsSaved(true);
    setChartsDataReady(true);

    setCharts([]);
  };

  const handleSave = async () => {
    reportData!.name = reportName;
    reportData!.is_public = reportIsPublic;

    await saveReport(reportData!, user.token).then(res => {
      setReportIsSaved(true);
      reportData!._id = res._id;
    });
  };

  const handleModify = async () => {
    reportData!.name = reportName;
    reportData!.is_public = reportIsPublic;

    await updateReport(reportData!, reportData!._id!, user.token).then(res => {
      setReportIsSaved(true);
    });
  };

  const handleReportDelete = async (id: string) => {
    await deleteReport(id, user.token).then(res => {
      personalReports.splice(personalReports.findIndex(e => e._id === id), 1);
      setPersonalReports([...personalReports]);
      publicReports.splice(publicReports.findIndex(e => e._id === id), 1);
      setPublicReports([...publicReports]);
    });
  };

  const handleReportClose = async () => {
    setReportData(undefined);
    getReports();
  }

  const handleAddChart = () => {
    setIsAddDialogOpen(true);
    //@ts-ignore
    addDialogRef.current.updateDialogState(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    //@ts-ignore
    addDialogRef.current.updateDialogState(false);
  };

  const handleAddDialogLoad = (chart: IChart) => {
    setIsAddDialogOpen(false);
    //@ts-ignore
    addDialogRef.current.updateDialogState(false);

    reportData?.charts.push(chart);
    buildChart(chart).then(chart => {
      setCharts([...charts, chart]);
    });

    setReportIsSaved(false);
  };

  const handleChartDelete = (index: number) => {
    reportData!.charts.splice(index, 1);
    charts.splice(index, 1);
    setCharts([...charts]);

    setReportIsSaved(false);
  };

  const handleChartMoveUp = (index: number) => {
    if(index > 0){
      const temp = reportData!.charts[index];
      reportData!.charts[index] = reportData!.charts[index - 1];
      reportData!.charts[index - 1] = temp;

      const chartTemp = charts[index];
      charts[index] = charts[index - 1];
      charts[index - 1] = chartTemp;
      setCharts([...charts]);

      setReportIsSaved(false);
    }
  };

  const handleChartMoveDown = (index: number) => {
    if(index < reportData!.charts.length - 1){
      const temp = reportData!.charts[index];
      reportData!.charts[index] = reportData!.charts[index + 1];
      reportData!.charts[index + 1] = temp;

      const chartTemp = charts[index];
      charts[index] = charts[index + 1];
      charts[index + 1] = chartTemp;
      setCharts([...charts]);

      setReportIsSaved(false);
    }
  };

  const buildAllCharts = async (data: IReport) => {
    charts.splice(0, charts.length);
    for(let i = 0; i < data.charts.length; i++){
      charts.push(await buildChart(data.charts[i]));
    }
    setCharts([...charts]);
    setChartsDataReady(true);
  }

  const buildChart = async (chart: IChart) => {
    const datasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [];
    const labels: Set<string> = new Set();

    for(let j = 0; j < chart.values.length; j++){
      let value = chart.values[j];
      const data: IData[] = await getData(
        value.location_code,
        value.indicator.key,
        moment(chart.start_date).format('YYYY-MM-DD'),
        moment(chart.end_date).format('YYYY-MM-DD'),
        value.is_custom_location
      );
      const dataset: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]> = {
        type: value.chart_type === 'area' ? 'line' : value.chart_type,
        label: value.location_code + ' - ' + value.indicator.label,
        data: [],
        fill: value.chart_type === 'area' ? value.fill : undefined,
        backgroundColor: value.color,
        borderColor: value.color,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      };

      const perNumber = 1000000;
      const population = !value.is_custom_location
        ? locations.find(elem => elem.code === value.location_code)?.population ?? perNumber
        : await getCustomLocation(value.location_code, user.token).then(res => res.population ?? perNumber);

      //if key is not a 'new' value, fill empty spaces with last data
      let lastData = 0;
      data.forEach(dataDay => {
        labels.add(moment(dataDay.date).format('YYYY-MM-DD'));
        if(dataDay[value.indicator.key as keyof typeof dataDay]){
          let dayData = dataDay[value.indicator.key as keyof typeof dataDay] as number;

          if(value.indicator.per_million){
            dayData = (dayData! / population) * perNumber
          }

          //Save last data only if key is not new value
          if(!value.indicator.key.includes('new')){
            lastData = dayData!;
          }
          dataset.data.push(dayData!);
        }
        else{
          dataset.data.push(lastData);
        }
      });

      if(value.indicator.average){
        if(value.indicator.average === 7){
          dataset.data = sevenDayAverage(dataset.data);
        }
        else if(value.indicator.average === 14){
          dataset.data = fourteenDayAverage(dataset.data);
        }
      }

      datasets.unshift(dataset);
    }

    const customChartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: Array.from(labels),
        datasets: datasets
      },
      options: COMMON_CHART_OPTIONS
    }

    return {
      name: chart.name,
      config: customChartConfiguration
    }
  };

  const loadReport = (data: IReport) => {
    setReportData(data);
    setReportName(data.name);
    setReportIsPublic(data.is_public);
    setChartsDataReady(false);
    buildAllCharts(data);
  }

  useEffect(() => {
    async function loadZoom() {
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      Chart.register(zoomPlugin);
      setChartReady(true);
    } loadZoom();
  }, []);

  const getReports = async () => {
    const resPersonal = user.token ? await getReportsPersonal(user.token) : [];
    const resPublic = await getReportsPublic();

    setPersonalReports(resPersonal);
    setPublicReports(resPublic);
  };

  useEffect(() => {
    getReports();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Reports</title>
        <meta name="description" content="CovidTracker Reports" />
      </Head>

      <section className={styles.page_container}>
        { !reportData ?
          <>
            <h1>New report</h1>
            <div>
              <Button
                size="small"
                variant="outlined"
                endIcon={<AddIcon />}
                onClick={handleNewReportClickOpen}
              >
                Create new report
              </Button>
            </div>
            <div className={styles.report_cards_container}>
              {
                publicReports.length > 0 &&
                <div className={styles.report_card_full_container}>
                  <h2>Public reports</h2>
                  <div className={styles.report_card_container}>
                    {publicReports.map((report, i) => (
                      <Card
                        key={i}
                        className={styles.report_card}
                        onClick={() => { setReportIsSaved(true); loadReport(report); }}
                      >
                        <CardContent className={styles.report_card_content}>
                          <h4>{report.name}</h4>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              }
              {
                personalReports.length > 0 &&
                <div className={styles.report_card_full_container}>
                  <h2>Personal reports</h2>
                  <div className={styles.report_card_container}>
                    {personalReports.map((report, i) => (
                      <Card
                        key={i}
                        className={styles.report_card}
                        onClick={() => { setReportIsSaved(true); loadReport(report) }}
                      >
                        <CardContent className={styles.report_card_content}>
                          <h4>{report.name}</h4>
                        </CardContent>
                        <div className={styles.report_card_actions}>
                          <IconButton
                            size='small'
                            onClick={event => {
                              event.stopPropagation();
                              handleReportDelete(report._id);
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
            <h2>Report</h2>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <TextField
                fullWidth
                label="Report Name"
                variant="standard"
                size='small'
                inputProps={{ maxLength: 120 }}
                value={reportName}
                onChange={(e) => {
                  setReportName(e.target.value);
                  setReportIsSaved(false);
                }}
                sx={{ marginBottom: 1 }}
              />
              <FormGroup>
                <FormControlLabel control={
                  <Switch checked={reportIsPublic} onChange={(e) => {
                    setReportIsPublic(e.target.checked);
                    setReportIsSaved(false);
                  }} />
                } label="Public" labelPlacement="start" />
              </FormGroup>
            </div>
            <div style={{display: 'flex', gap: 10}}>
              {
                reportData._id && user._id && reportData.ownerId === user._id &&
                <Button
                  size="small"
                  variant="outlined"
                  color='success'
                  endIcon={<AutoFixHighIcon />}
                  onClick={handleModify}
                  disabled={reportIsSaved || reportName === '' || charts.length < 1 || !user}
                >
                  Modify report
                </Button>
              }
              {
                !reportData._id && user._id && reportData.ownerId === user._id &&
                <Button
                  size="small"
                  variant="outlined"
                  color='success'
                  endIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={reportIsSaved || reportName === '' || charts.length < 1 || !user}
                >
                  Save report
                </Button>
              }
              <Button
                size="small"
                variant="outlined"
                color='error'
                endIcon={<CloseIcon />}
                onClick={handleReportClose}
              >
                Close report
              </Button>
            </div>
            { reportIsPublic && <small>Note: Private charts included in the report will be visible to everyone</small> }

            <div className={styles.report_charts_container}>
                {
                  chartReady && chartsDataReady
                  ? charts.map((chart, i) => (
                      <div key={i}>
                        <h3>{chart.name}</h3>
                        <div  className={styles.single_chart_section}>
                          <div className={styles.chart_container}>
                            <ChartJS type={chart.config.type} data={chart.config.data} options={chart.config.options}/>
                          </div>
                          <div className={styles.chart_actions}>
                            <div className={styles.action_buttons}>
                              <IconButton
                                size='small'
                                onClick={() => { handleChartMoveUp(i) }}
                              >
                                <KeyboardArrowUpIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => { handleChartMoveDown(i) }}
                              >
                                <KeyboardArrowDownIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => { handleChartDelete(i) }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : <div className={styles.spinner_container}>
                      <CircularProgress />
                    </div>
                }
              
              <Button
                variant="outlined"
                className={styles.report_add_chart_button}
                onClick={handleAddChart}
              >
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <AddIcon />
                  Add new chart
                </div>
              </Button>
            </div>
          </>
        }
      </section>

      <AddDialog
        ref={addDialogRef}
        user={user}
        handleDialogClose={handleAddDialogClose}
        handleDialogAdd={handleAddDialogLoad}
        isDialogOpen={isAddDialogOpen}
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

export default Report
