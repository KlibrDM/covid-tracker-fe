import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../components/layout'
import styles from '../../styles/ChartPage.module.css'
import Chart from "chart.js/auto";
import { BubbleDataPoint, CategoryScale, ChartConfiguration, ChartDataset, ChartTypeRegistry, ScatterDataPoint } from "chart.js";
import { Chart as ChartJS } from "react-chartjs-2";
import { IData } from '../../models/data';
import { getData } from '../../lib/get-data';
import { useEffect, useRef, useState } from 'react';
import LatestData from '../../components/latest-data';
import { getLatestData } from '../../lib/get-latest-data';
import { loadLocations } from '../../lib/load-locations';
import { ILocation } from '../../models/location';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { fourteenDayAverage } from '../../utils/calculate-14-day-average';
import { CircularProgress, FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';
import moment from 'moment';
import _ from 'lodash';
import { CASES_CHART_OPTIONS, COMMON_CHART_OPTIONS } from '../../lib/chart-options';

Chart.register(CategoryScale);

interface IChartType {
  value: 'line' | 'bar' | 'area',
  label: 'Line' | 'Bar' | 'Area',
  type: 'line' | 'bar';
  fill?: {
    target: string;
    above: string;
    below: string;
  }
}

const defaultStartDate = moment().subtract(1, 'year').format('YYYY-MM-DD');
const defaultChartType: IChartType = {
  value: 'area',
  label: 'Area',
  type: 'line',
  fill: {
    target: 'origin',
    above: '#12b3eb77',
    below: '#12b3eb77'
  },
}

const Cases: NextPage = (props: any) => {
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [chartType, setChartType] = useState<string>(defaultChartType.value);
  const [showStringency, setShowStringency] = useState<boolean>(false);
  const [chartReady, setChartReady] = useState<boolean>(false);

  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;
  const latestData = props.latestData as IData[];

  //Get chart data
  const chartLabels: number[] = props.chartLabels;
  const newCasesChartData: number[] = props.newCasesChartData;
  const newCasesAverage: number[] = props.newCasesAverage;
  const [stringencyIndex, setStringencyIndex] = useState<number[]>(props.stringencyIndex);
  const reproductionRate: number[] = props.reproductionRate;
  const totalCasesChartData: number[] = props.totalCasesChartData;
  const perMillionCasesChartData: number[] = props.perMillionCasesChartData;
  
  //Build charts
  const newCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'New Cases',
      data: newCasesChartData,
      fill: {
        target: 'origin',
        above: '#12b3eb77',
        below: '#12b3eb77'
      },
      backgroundColor: '#12b3eb',
      borderColor: '#12b3eb',
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1,
      order: 3,
    },
    {
      type: 'line',
      label: '14 day average',
      data: newCasesAverage,
      backgroundColor: '#ffa32b',
      borderColor: '#ffa32b',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      order: 2,
    },
    {
      type: 'line',
      label: 'Stringency Index',
      data: showStringency ? stringencyIndex : [],
      fill: {
        target: 'origin',
        above: '#ceb3eb44',
        below: '#ceb3eb44'
      },
      backgroundColor: '#ceb3eb',
      borderColor: '#ceb3eb',
      borderWidth: 1,
      pointRadius: 0,
      pointHoverRadius: 0,
      tension: 0.1,
      order: 1,
      yAxisID: 'percentage',
    },
    {
      type: 'line',
      label: 'Reproduction rate',
      data: reproductionRate,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      pointRadius: 0,
    },
  ];
  const newCasesChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: newCasesChartDatasets
    },
    options: CASES_CHART_OPTIONS(newCasesChartDatasets)
  };

  const totalCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Total Cases',
      data: totalCasesChartData,
      fill: {
        target: 'origin',
        above: '#12b3eb77',
        below: '#12b3eb77'
      },
      backgroundColor: '#12b3eb',
      borderColor: '#12b3eb',
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

  const perMillionCasesChartDatasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] = [
    {
      label: 'Cases per 1M',
      data: perMillionCasesChartData,
      fill: {
        target: 'origin',
        above: '#12b3eb77',
        below: '#12b3eb77'
      },
      backgroundColor: '#12b3eb',
      borderColor: '#12b3eb',
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }
  ];
  const perMillionCasesChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: perMillionCasesChartDatasets
    },
    options: COMMON_CHART_OPTIONS
  };

  const [newCasesChart, setNewCasesChart] = useState(newCasesChartConfiguration);
  const [totalCasesChart, setTotalCasesChart] = useState(totalCasesChartConfiguration);
  const [perMillionCasesChart, setPerMillionCasesChart] = useState(perMillionCasesChartConfiguration);

  const newCasesChartRef = useRef(null);
  const totalCasesChartRef = useRef(null);
  const perMillionCasesChartRef = useRef(null);

  const startDates = [
    {date: 'ALL', label: 'ALL'},
    {date: moment().subtract(1, 'year').format('YYYY-MM-DD'), label: '1Y'},
    {date: moment().subtract(6, 'month').format('YYYY-MM-DD'), label: '6M'},
    {date: moment().subtract(3, 'month').format('YYYY-MM-DD'), label: '3M'},
    {date: moment().subtract(1, 'month').format('YYYY-MM-DD'), label: '1M'},
    {date: moment().subtract(1, 'week').format('YYYY-MM-DD'), label: '1W'},
  ];

  const chartTypes: IChartType[] = [{
    value: 'area',
    label: 'Area',
    type: 'line',
    fill: {
      target: 'origin',
      above: '#12b3eb77',
      below: '#12b3eb77'
    }
  },
  {
    value: 'line',
    label: 'Line',
    type: 'line',
  },
  {
    value: 'bar',
    label: 'Bar',
    type: 'bar',
  }];

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
      getData(location, ['new_cases', 'total_cases', 'reproduction_rate', 'stringency_index'], queryStartDate).then((data: IData[]) => {
        //Chart data arrays
        const chartLabels: string[] = [];
        const newCasesChartData: number[] = [];
        const newCasesAverage: number[] = [];
        const stringencyIndex: number[] = [];
        const reproductionRate: number[] = [];
        const totalCasesChartData: number[] = [];
        const perMillionCasesChartData: number[] = [];

        //Data
        const perNumber = 1000000;
        const population = locations.find(e => e.code === location)?.population ?? perNumber;

        //Push data to arrays
        data.forEach(e => {
          const date = moment(e.date).format('YYYY-MM-DD');
          chartLabels.push(date);

          //New cases chart
          newCasesChartData.push(e.new_cases ?? 0);
          stringencyIndex.push(e.stringency_index ?? 0);
          reproductionRate.push((e.reproduction_rate && e.reproduction_rate > 0) ? e.reproduction_rate : 0);

          //Total cases chart
          totalCasesChartData.push(e.total_cases ?? 0);

          //Per million cases chart
          e.new_cases = e.new_cases ?? 0;
          perMillionCasesChartData.push((e.new_cases! / population) * perNumber);
        });

        //Create 14 day average
        newCasesAverage.push(...fourteenDayAverage(newCasesChartData));

        //Set data
        newCasesChart.data.datasets[0].data = newCasesChartData;
        newCasesChart.data.datasets[1].data = newCasesAverage;
        newCasesChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        newCasesChart.data.datasets[3].data = reproductionRate;
        newCasesChart.data.labels = chartLabels;

        totalCasesChart.data.datasets[0].data = totalCasesChartData;
        totalCasesChart.data.labels = chartLabels;

        perMillionCasesChart.data.datasets[0].data = perMillionCasesChartData;
        perMillionCasesChart.data.labels = chartLabels;

        setStringencyIndex(stringencyIndex);

        setNewCasesChart(_.cloneDeep(newCasesChart));
        setTotalCasesChart(_.cloneDeep(totalCasesChart));
        setPerMillionCasesChart(_.cloneDeep(perMillionCasesChart));

        setStartDate(newStartDate);
      });

      //Reset chart zoom
      if (newCasesChartRef && newCasesChartRef.current) {
        //@ts-ignore
        newCasesChartRef.current.resetZoom();
      }
      if (totalCasesChartRef && totalCasesChartRef.current) {
        //@ts-ignore
        totalCasesChartRef.current.resetZoom();
      }
      if (perMillionCasesChartRef && perMillionCasesChartRef.current) {
        //@ts-ignore
        perMillionCasesChartRef.current.resetZoom();
      }
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
    if (newChartType) {
      const chartType = chartTypes.find(e => e.value === newChartType);

      if(chartType){
        newCasesChart.type = chartType.type;
        setUnsetArea(newCasesChart, chartType);
        setNewCasesChart(_.cloneDeep(newCasesChart));

        totalCasesChart.type = chartType.type;
        setUnsetArea(totalCasesChart, chartType);
        setTotalCasesChart(_.cloneDeep(totalCasesChart));

        perMillionCasesChart.type = chartType.type;
        setUnsetArea(perMillionCasesChart, chartType);
        setPerMillionCasesChart(_.cloneDeep(perMillionCasesChart));
        
        setChartType(chartType.value);
      }
    }
  }

  const handleStringencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if(checked){
      newCasesChart.data.datasets[2].data = stringencyIndex;
    }
    else{
      newCasesChart.data.datasets[2].data = [];
    }
    setNewCasesChart(_.cloneDeep(newCasesChart));
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

  const changeLocation = (newLocation: string) => {
    if (newLocation) {
      const queryStartDate = startDate === 'ALL' ? '' : startDate;

      //load data with new location
      getData(newLocation, ['new_cases', 'total_cases', 'reproduction_rate', 'stringency_index'], queryStartDate).then((data: IData[]) => {
        //Chart data arrays
        const chartLabels: string[] = [];
        const newCasesChartData: number[] = [];
        const newCasesAverage: number[] = [];
        const stringencyIndex: number[] = [];
        const reproductionRate: number[] = [];
        const totalCasesChartData: number[] = [];
        const perMillionCasesChartData: number[] = [];

        //Data
        const perNumber = 1000000;
        const population = locations.find(e => e.code === location)?.population ?? perNumber;

        //Push data to arrays
        data.forEach(e => {
          const date = moment(e.date).format('YYYY-MM-DD');
          chartLabels.push(date);

          //New cases chart
          newCasesChartData.push(e.new_cases ?? 0);
          stringencyIndex.push(e.stringency_index ?? 0);
          reproductionRate.push((e.reproduction_rate && e.reproduction_rate > 0) ? e.reproduction_rate : 0);

          //Total cases chart
          totalCasesChartData.push(e.total_cases ?? 0);

          //Per million cases chart
          e.new_cases = e.new_cases ?? 0;
          perMillionCasesChartData.push((e.new_cases! / population) * perNumber);
        });

        //Create 14 day average
        newCasesAverage.push(...fourteenDayAverage(newCasesChartData));

        //Set data
        newCasesChart.data.datasets[0].data = newCasesChartData;
        newCasesChart.data.datasets[1].data = newCasesAverage;
        newCasesChart.data.datasets[2].data = showStringency ? stringencyIndex : [];
        newCasesChart.data.datasets[3].data = reproductionRate;
        newCasesChart.data.labels = chartLabels;

        totalCasesChart.data.datasets[0].data = totalCasesChartData;
        totalCasesChart.data.labels = chartLabels;

        perMillionCasesChart.data.datasets[0].data = perMillionCasesChartData;
        perMillionCasesChart.data.labels = chartLabels;

        setStringencyIndex(stringencyIndex);

        setNewCasesChart(_.cloneDeep(newCasesChart));
        setTotalCasesChart(_.cloneDeep(totalCasesChart));
        setPerMillionCasesChart(_.cloneDeep(perMillionCasesChart));

        setLocation(newLocation);
      });
    }
  }

  return (
    <Layout>
      <Head>
        <title>Cases</title>
        <meta name="description" content="CovidTracker Cases" />
      </Head>

      <section className={styles.page_container}>
        <section className={styles.charts_section}>
          <div className={styles.page_details}>
            <h1 className={styles.page_title}>Covid-19 Cases in {locationName}</h1>
          </div>
          <div className={styles.chart_controller}>
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
            <h4>New Cases</h4>
            <div className={styles.chart_container}>
              {
                chartReady
                ? <ChartJS ref={newCasesChartRef} type={newCasesChart.type} data={newCasesChart.data} options={newCasesChart.options}/>
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
                  ? <ChartJS ref={totalCasesChartRef} type={totalCasesChart.type} data={totalCasesChart.data} options={totalCasesChart.options}/>
                  : <div className={styles.spinner_container}>
                      <CircularProgress />
                    </div>
                }
              </div>
            </div>
            <div className={styles.single_chart_section}>
              <p>Per million</p>
              <div className={styles.chart_container}>
                {
                  chartReady
                  ? <ChartJS ref={perMillionCasesChartRef} type={perMillionCasesChart.type} data={perMillionCasesChart.data} options={perMillionCasesChart.options}/>
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
            key1="total_cases"
            label1="Total cases"
            key2="new_cases"
            label2="New cases"
            changeLocation={changeLocation}
          />
        </section>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';
  const casesData: IData[] = await getData(location, ['new_cases', 'total_cases', 'reproduction_rate', 'stringency_index'], defaultStartDate);
  const latestData: IData[] = await getLatestData(undefined, ['new_cases','total_cases']);

  //Chart data arrays
  const chartLabels: string[] = [];
  const newCasesChartData: number[] = [];
  const newCasesAverage: number[] = [];
  const stringencyIndex: number[] = [];
  const reproductionRate: number[] = [];
  const totalCasesChartData: number[] = [];
  const perMillionCasesChartData: number[] = [];

  //Data
  const perNumber = 1000000;
  const population = locations.find(e => e.code === location)?.population ?? perNumber;

  //Push data to arrays
  casesData.forEach(e => {
    const date = moment(e.date).format('YYYY-MM-DD');
    chartLabels.push(date);

    //New cases chart
    newCasesChartData.push(e.new_cases ?? 0);
    stringencyIndex.push(e.stringency_index ?? 0);
    reproductionRate.push((e.reproduction_rate && e.reproduction_rate > 0) ? e.reproduction_rate : 0);

    //Total cases chart
    totalCasesChartData.push(e.total_cases ?? 0);

    //Per million cases chart
    e.new_cases = e.new_cases ?? 0;
    perMillionCasesChartData.push((e.new_cases! / population) * perNumber);
  });

  //Create 14 day average
  newCasesAverage.push(...fourteenDayAverage(newCasesChartData));

  return { props: {
    location: location,
    locations: locations,
    latestData: latestData,
    chartLabels: chartLabels,
    newCasesChartData: newCasesChartData,
    newCasesAverage: newCasesAverage,
    stringencyIndex: stringencyIndex,
    reproductionRate: reproductionRate,
    totalCasesChartData: totalCasesChartData,
    perMillionCasesChartData: perMillionCasesChartData,
  } };
}

export default Cases
