export interface IChartType {
  value: 'line' | 'bar' | 'area',
  label: 'Line' | 'Bar' | 'Area',
  type: 'line' | 'bar';
  fill?: {
    target: string;
    above: string;
    below: string;
  }
}
