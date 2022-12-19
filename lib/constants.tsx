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

export const CASES_COLOR = '#12b3eb';
export const CASES_FILL_COLORS = {
  target: 'origin',
  above: '#12b3eb77',
  below: '#12b3eb77'
}

export const STRINGENCY_INDEX_COLOR = '#ceb3eb';
export const STRINGENCY_INDEX_FILL_COLORS = {
  target: 'origin',
  above: '#ceb3eb44',
  below: '#ceb3eb44'
}

export const DEATHS_COLOR = '#282828';
export const DEATHS_FILL_COLORS = {
  target: 'origin',
  above: '#28282877',
  below: '#28282877'
}

export const EXCESS_MORTALITY_COLOR = '#282828';
export const EXCESS_MORTALITY_FILL_COLORS = {
  target: 'origin',
  above: '#ff232b77',
  below: '#23ff2b77'
}

export const TESTS_COLOR = '#ffa32b';
export const TESTS_FILL_COLORS = {
  target: 'origin',
  above: '#ffa32b77',
  below: '#ffa32b77'
}

export const VACCINATIONS_COLOR = '#11d011';
export const VACCINATIONS_FILL_COLORS = {
  target: 'origin',
  above: '#11d01177',
  below: '#11d01177'
}

export const FULLY_VACCINATED_COLOR = '#00aa00';
export const FULLY_VACCINATED_FILL_COLORS = {
  target: 'origin',
  above: '#00aa0077',
  below: '#00aa0077'
}
