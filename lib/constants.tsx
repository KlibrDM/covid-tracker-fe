import moment from "moment";
import { IChartType } from "../models/charts";

export const DEFAULT_START_DATES = [
  {date: 'ALL', label: 'ALL'},
  {date: moment().subtract(1, 'year').format('YYYY-MM-DD'), label: '1Y'},
  {date: moment().subtract(6, 'month').format('YYYY-MM-DD'), label: '6M'},
  {date: moment().subtract(3, 'month').format('YYYY-MM-DD'), label: '3M'},
  {date: moment().subtract(1, 'month').format('YYYY-MM-DD'), label: '1M'},
  {date: moment().subtract(1, 'week').format('YYYY-MM-DD'), label: '1W'},
];

export const DEFAULT_CHART_TYPES: IChartType[] = [{
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
