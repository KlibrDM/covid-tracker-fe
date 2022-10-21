import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../components/layout'
import styles from '../../styles/ChartPage.module.css'
import Chart from "chart.js/auto";
import { CategoryScale, ChartConfiguration } from "chart.js";
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
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import _ from 'lodash';

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
  const [chartReady, setChartReady] = useState<boolean>(false);

  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;
  const latestData = props.latestData as IData[];
  
  const [newCasesChart, setNewCasesChart] = useState(props.newCases as ChartConfiguration);
  const [totalCasesChart, setTotalCasesChart] = useState(props.totalCases as ChartConfiguration);
  const [perMillionCasesChart, setPerMillionCasesChart] = useState(props.perMillionCases as ChartConfiguration);

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
      getData(location, ['new_cases', 'total_cases'], queryStartDate).then((data: IData[]) => {
        //New Cases
        const newCasesLabels: string[] = [];
        const newCasesChartData: number[] = [];

        data.forEach(e => {
          newCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
          newCasesChartData.push(e.new_cases ?? 0);
        });

        const newCasesAverage = fourteenDayAverage(newCasesChartData);

        newCasesChart.data.datasets[0].data = newCasesChartData;
        newCasesChart.data.datasets[1].data = newCasesAverage;
        newCasesChart.data.labels = newCasesLabels;

        setNewCasesChart(_.cloneDeep(newCasesChart));
        
        //Total Cases
        const totalCasesLabels: string[] = [];
        const totalCasesChartData: number[] = [];

        data.forEach(e => {
          totalCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
          totalCasesChartData.push(e.total_cases ?? 0);
        });

        totalCasesChart.data.datasets[0].data = totalCasesChartData;
        totalCasesChart.data.labels = totalCasesLabels;

        setTotalCasesChart(_.cloneDeep(totalCasesChart));

        //Per Million Cases
        const perMillionCasesLabels: string[] = [];
        const perMillionCasesChartData: number[] = [];
        const perNumber = 1000000;
        const population = locations.find(e => e.code === location)?.population ?? perNumber;
        
        data.forEach(e => {
          perMillionCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
          e.new_cases = e.new_cases ?? 0;
          perMillionCasesChartData.push((e.new_cases / population) * perNumber);
        });

        perMillionCasesChart.data.datasets[0].data = perMillionCasesChartData;
        perMillionCasesChart.data.labels = perMillionCasesLabels;

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
      getData(newLocation, ['new_cases', 'total_cases'], queryStartDate).then((data: IData[]) => {
        //New Cases
        const newCasesLabels: string[] = [];
        const newCasesChartData: number[] = [];

        data.forEach(e => {
          newCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
          newCasesChartData.push(e.new_cases ?? 0);
        });

        const newCasesAverage = fourteenDayAverage(newCasesChartData);

        newCasesChart.data.datasets[0].data = newCasesChartData;
        newCasesChart.data.datasets[1].data = newCasesAverage;
        newCasesChart.data.labels = newCasesLabels;

        setNewCasesChart(_.cloneDeep(newCasesChart));
        
        //Total Cases
        const totalCasesLabels: string[] = [];
        const totalCasesChartData: number[] = [];

        data.forEach(e => {
          totalCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
          totalCasesChartData.push(e.total_cases ?? 0);
        });

        totalCasesChart.data.datasets[0].data = totalCasesChartData;
        totalCasesChart.data.labels = totalCasesLabels;

        setTotalCasesChart(_.cloneDeep(totalCasesChart));

        //Per Million Cases
        const perMillionCasesLabels: string[] = [];
        const perMillionCasesChartData: number[] = [];
        const perNumber = 1000000;
        const population = locations.find(e => e.code === location)?.population ?? perNumber;
        
        data.forEach(e => {
          perMillionCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
          e.new_cases = e.new_cases ?? 0;
          perMillionCasesChartData.push((e.new_cases / population) * perNumber);
        });

        perMillionCasesChart.data.datasets[0].data = perMillionCasesChartData;
        perMillionCasesChart.data.labels = perMillionCasesLabels;

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
  const casesData: IData[] = await getData(location, ['new_cases', 'total_cases'], defaultStartDate);
  const latestData: IData[] = await getLatestData(undefined, ['new_cases','total_cases']);

  /* --------------- */
  /* New cases chart */
  /* --------------- */
  const newCasesLabels: string[] = [];
  const newCasesChartData: number[] = [];

  casesData.forEach(e => {
    newCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
    newCasesChartData.push(e.new_cases ?? 0);
  });

  //Create 14 day average
  const newCasesAverage = fourteenDayAverage(newCasesChartData);

  const newCasesChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: newCasesLabels,
      datasets: [{
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
        order: 2,
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
        order: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'bottom',
          reverse: true
        },
        zoom: {
          zoom: {
            drag:{
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
          }
        }
      },
    }
  };

  /* ----------------- */
  /* Total cases chart */
  /* ----------------- */
  const totalCasesLabels: string[] = [];
  const totalCasesChartData: number[] = [];

  casesData.forEach(e => {
    totalCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
    totalCasesChartData.push(e.total_cases ?? 0);
  });

  const totalCasesChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: totalCasesLabels,
      datasets: [{
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
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        zoom: {
          zoom: {
            drag:{
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
          }
        }
      },
    }
  };

  /* ----------------- */
  /* Per million chart */
  /* ----------------- */
  const perMillionCasesLabels: string[] = [];
  const perMillionCasesChartData: number[] = [];

  const perNumber = 1000000;
  const population = locations.find(e => e.code === location)?.population ?? perNumber;

  casesData.forEach(e => {
    perMillionCasesLabels.push(moment(e.date).format('YYYY-MM-DD'));
    e.new_cases = e.new_cases ?? 0;
    perMillionCasesChartData.push((e.new_cases! / population) * perNumber);
  });

  const perMillionCasesChartConfiguration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: perMillionCasesLabels,
      datasets: [{
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
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        zoom: {
          zoom: {
            drag:{
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
          }
        }
      },
    }
  };

  return { props: {
    location: location,
    locations: locations,
    newCases: newCasesChartConfiguration,
    totalCases: totalCasesChartConfiguration,
    perMillionCases: perMillionCasesChartConfiguration,
    latestData: latestData
  } };
}

export default Cases
