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
import { CASES_CHART_OPTIONS, COMMON_CHART_OPTIONS } from '../../lib/chart-options';
import { DEFAULT_CHART_TYPES, DEFAULT_START_DATES, FULLY_VACCINATED_COLOR, FULLY_VACCINATED_FILL_COLORS, STRINGENCY_INDEX_COLOR, STRINGENCY_INDEX_FILL_COLORS, VACCINATIONS_COLOR, VACCINATIONS_FILL_COLORS } from '../../lib/constants';
import { IChartType } from '../../models/charts';
import { isChartEmpty } from '../../utils/isChartEmpty';
import { IUser } from '../../models/user';

Chart.register(CategoryScale);

const startDates = DEFAULT_START_DATES;
const chartTypes: IChartType[] = DEFAULT_CHART_TYPES;

const defaultStartDate = startDates[1].date;
const defaultChartType: IChartType = chartTypes[0];

const Vaccinations: NextPage = (props: any) => {
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
  const peopleVaccinated: number[] = props.peopleVaccinated;
  const peopleFullyVaccinated: number[] = props.peopleFullyVaccinated;
  const [stringencyIndex, setStringencyIndex] = useState<number[]>(props.stringencyIndex);
  const totalVaccinations: number[] = props.totalVaccinations;
  const newVaccinations: number[] = props.newVaccinations;
  
  //Build charts
  const peopleVaccinatedChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'People Vaccinated',
      data: peopleVaccinated,
      fill: VACCINATIONS_FILL_COLORS,
      backgroundColor: VACCINATIONS_COLOR,
      borderColor: VACCINATIONS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 3,
    },
    {
      label: 'People Fully Vaccinated',
      data: peopleFullyVaccinated,
      fill: FULLY_VACCINATED_FILL_COLORS,
      backgroundColor: FULLY_VACCINATED_COLOR,
      borderColor: FULLY_VACCINATED_COLOR,
      borderWidth: 1,
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
  const peopleVaccinatedChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: peopleVaccinatedChartDatasets
    },
    options: CASES_CHART_OPTIONS(peopleVaccinatedChartDatasets)
  };

  const totalVaccinationsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Total Vaccinations',
      data: totalVaccinations,
      fill: VACCINATIONS_FILL_COLORS,
      backgroundColor: VACCINATIONS_COLOR,
      borderColor: VACCINATIONS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }
  ];
  const totalVaccinationsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: totalVaccinationsChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const newVaccinationsChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'New Vaccinations',
      data: newVaccinations,
      fill: VACCINATIONS_FILL_COLORS,
      backgroundColor: VACCINATIONS_COLOR,
      borderColor: VACCINATIONS_COLOR,
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }
  ];
  const newVaccinationsChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: newVaccinationsChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const [peopleVaccinatedChart, setPeopleVaccinatedChart] = useState(peopleVaccinatedChartConfiguration);
  const [totalVaccinationsChart, setTotalVaccinationsChart] = useState(totalVaccinationsChartConfiguration);
  const [newVaccinationsChart, setNewVaccinationsChart] = useState(newVaccinationsChartConfiguration);

  const peopleVaccinatedChartRef = useRef(null);
  const totalVaccinationsChartRef = useRef(null);
  const newVaccinationsChartRef = useRef(null);

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
      getData(location, ['people_vaccinated', 'people_fully_vaccinated', 'total_vaccinations', 'new_vaccinations', 'stringency_index'], queryStartDate, undefined, isCustomLocation).then((data: IData[]) => {
        const {
          chartLabels,
          peopleVaccinated,
          peopleFullyVaccinated,
          stringencyIndex,
          totalVaccinations,
          newVaccinations
        } = prepareChartData(data);

        //Set data
        peopleVaccinatedChart.data.datasets[0].data = peopleVaccinated;
        peopleVaccinatedChart.data.datasets[1].data = peopleFullyVaccinated;
        peopleVaccinatedChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        peopleVaccinatedChart.data.labels = chartLabels;

        totalVaccinationsChart.data.datasets[0].data = totalVaccinations;
        totalVaccinationsChart.data.labels = chartLabels;

        newVaccinationsChart.data.datasets[0].data = newVaccinations;
        newVaccinationsChart.data.labels = chartLabels;

        setStringencyIndex(stringencyIndex);

        setPeopleVaccinatedChart(_.cloneDeep(peopleVaccinatedChart));
        setTotalVaccinationsChart(_.cloneDeep(totalVaccinationsChart));
        setNewVaccinationsChart(_.cloneDeep(newVaccinationsChart));

        setStartDate(newStartDate);
      });

      //Reset chart zoom
      if (peopleVaccinatedChartRef && peopleVaccinatedChartRef.current) {
        //@ts-ignore
        peopleVaccinatedChartRef.current.resetZoom();
      }
      if (totalVaccinationsChartRef && totalVaccinationsChartRef.current) {
        //@ts-ignore
        totalVaccinationsChartRef.current.resetZoom();
      }
      if (newVaccinationsChartRef && newVaccinationsChartRef.current) {
        //@ts-ignore
        newVaccinationsChartRef.current.resetZoom();
      }
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
    if (newChartType) {
      const chartType = chartTypes.find(e => e.value === newChartType);

      if(chartType){
        chartType.fill = VACCINATIONS_FILL_COLORS;

        peopleVaccinatedChart.type = chartType.type;
        setUnsetArea(peopleVaccinatedChart, chartType);
        setPeopleVaccinatedChart(_.cloneDeep(peopleVaccinatedChart));

        totalVaccinationsChart.type = chartType.type;
        setUnsetArea(totalVaccinationsChart, chartType);
        setTotalVaccinationsChart(_.cloneDeep(totalVaccinationsChart));

        newVaccinationsChart.type = chartType.type;
        setUnsetArea(newVaccinationsChart, chartType);
        setNewVaccinationsChart(_.cloneDeep(newVaccinationsChart));
        
        setChartType(chartType.value);
      }
    }
  }

  const handleStringencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if(checked){
      peopleVaccinatedChart.data.datasets[2].data = stringencyIndex;
    }
    else{
      peopleVaccinatedChart.data.datasets[2].data = [];
    }
    setPeopleVaccinatedChart(_.cloneDeep(peopleVaccinatedChart));
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
      getData(newLocation, ['people_vaccinated', 'people_fully_vaccinated', 'total_vaccinations', 'new_vaccinations', 'stringency_index'], queryStartDate, undefined, isCustom).then((data: IData[]) => {
        const {
          chartLabels,
          peopleVaccinated,
          peopleFullyVaccinated,
          stringencyIndex,
          totalVaccinations,
          newVaccinations
        } = prepareChartData(data);

        //Set data
        peopleVaccinatedChart.data.datasets[0].data = peopleVaccinated;
        peopleVaccinatedChart.data.datasets[1].data = peopleFullyVaccinated;
        peopleVaccinatedChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        peopleVaccinatedChart.data.labels = chartLabels;

        totalVaccinationsChart.data.datasets[0].data = totalVaccinations;
        totalVaccinationsChart.data.labels = chartLabels;

        newVaccinationsChart.data.datasets[0].data = newVaccinations;
        newVaccinationsChart.data.labels = chartLabels;

        setStringencyIndex(stringencyIndex);

        setPeopleVaccinatedChart(_.cloneDeep(peopleVaccinatedChart));
        setTotalVaccinationsChart(_.cloneDeep(totalVaccinationsChart));
        setNewVaccinationsChart(_.cloneDeep(newVaccinationsChart));

        setLocation(newLocation);
      });
    }
  }

  return (
    <Layout>
      <Head>
        <title>Vaccinations</title>
        <meta name="description" content="CovidTracker Vaccinations" />
      </Head>

      <section className={styles.page_container}>
        <section className={styles.charts_section}>
          <div className={styles.page_details}>
            <h1 className={styles.page_title}>Covid-19 Vaccinations in {locationName}</h1>
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
            <h4>People Vaccinated</h4>
            <div className={styles.chart_container}>
              {
                chartReady
                ? !isChartEmpty(peopleVaccinatedChart.data.datasets)
                  ? <ChartJS ref={peopleVaccinatedChartRef} type={peopleVaccinatedChart.type} data={peopleVaccinatedChart.data} options={peopleVaccinatedChart.options}/>
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
                  ? !isChartEmpty(totalVaccinationsChart.data.datasets)
                    ? <ChartJS ref={totalVaccinationsChartRef} type={totalVaccinationsChart.type} data={totalVaccinationsChart.data} options={totalVaccinationsChart.options}/>
                    : <p className={styles.chart_no_data_text}>No data to display</p>
                  : <div className={styles.spinner_container}>
                      <CircularProgress />
                    </div>
                }
              </div>
            </div>
            <div className={styles.single_chart_section}>
              <p>New</p>
              <div className={styles.chart_container}>
                {
                  chartReady
                  ? !isChartEmpty(newVaccinationsChart.data.datasets)
                    ? <ChartJS ref={newVaccinationsChartRef} type={newVaccinationsChart.type} data={newVaccinationsChart.data} options={newVaccinationsChart.options}/>
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
            key1="total_vaccinations"
            label1="Total Vaccinations"
            key2="new_vaccinations"
            label2="New Vaccinations"
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
  const vaccinationsData: IData[] = await getData(location, ['people_vaccinated', 'people_fully_vaccinated', 'total_vaccinations', 'new_vaccinations', 'stringency_index'], defaultStartDate);
  const latestData: IData[] = await getLatestData(undefined, ['new_vaccinations','total_vaccinations']);

  const {
    chartLabels,
    peopleVaccinated,
    peopleFullyVaccinated,
    stringencyIndex,
    totalVaccinations,
    newVaccinations
  } = prepareChartData(vaccinationsData);

  return { props: {
    user: user,
    location: location,
    locations: locations,
    latestData: latestData,
    chartLabels: chartLabels,
    peopleVaccinated: peopleVaccinated,
    peopleFullyVaccinated: peopleFullyVaccinated,
    stringencyIndex: stringencyIndex,
    totalVaccinations: totalVaccinations,
    newVaccinations: newVaccinations
  } };
}

const prepareChartData = (data: IData[]) => {
  //Chart data arrays
  const chartLabels: string[] = [];
  const peopleVaccinated: number[] = [];
  const peopleFullyVaccinated: number[] = [];
  const stringencyIndex: number[] = [];
  const totalVaccinations: number[] = [];
  const newVaccinations: number[] = [];

  //Push data to arrays
  data.forEach((e, index) => {
    const date = moment(e.date).format('YYYY-MM-DD');
    chartLabels.push(date);

    //People vaccinated chart
    peopleVaccinated.push(e.people_vaccinated ?? 0);
    peopleFullyVaccinated.push(e.people_fully_vaccinated ?? 0);
    stringencyIndex.push(e.stringency_index ?? 0);

    //Total vaccinations chart
    totalVaccinations.push(e.total_vaccinations ?? 0);

    //New vaccinations chart
    newVaccinations.push(e.new_vaccinations ?? 0);
  });

  return {
    chartLabels,
    peopleVaccinated,
    peopleFullyVaccinated,
    stringencyIndex,
    totalVaccinations,
    newVaccinations
  };
}

export default Vaccinations
