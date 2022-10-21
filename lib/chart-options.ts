import { BubbleDataPoint, ChartDataset, ChartTypeRegistry, CoreChartOptions, DatasetChartOptions, ElementChartOptions, PluginChartOptions, ScaleChartOptions, ScatterDataPoint } from "chart.js";
import { _DeepPartialObject } from "chart.js/types/utils";

export const COMMON_CHART_OPTIONS: _DeepPartialObject<CoreChartOptions<keyof ChartTypeRegistry> & ElementChartOptions<keyof ChartTypeRegistry> & PluginChartOptions<keyof ChartTypeRegistry> & DatasetChartOptions<keyof ChartTypeRegistry> & ScaleChartOptions<keyof ChartTypeRegistry>> = {
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

export const CASES_CHART_OPTIONS = (data: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[]): _DeepPartialObject<CoreChartOptions<keyof ChartTypeRegistry> & ElementChartOptions<keyof ChartTypeRegistry> & PluginChartOptions<keyof ChartTypeRegistry> & DatasetChartOptions<keyof ChartTypeRegistry> & ScaleChartOptions<keyof ChartTypeRegistry>> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'bottom',
      reverse: true,
      labels: {
        filter: function(item, chart) {
          return !item.text.includes('Reproduction rate');
        }
      }
    },
    tooltip: {
      itemSort: function(a, b) {
        return a.datasetIndex - b.datasetIndex;
      }
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
});
