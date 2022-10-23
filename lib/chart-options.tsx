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
  scales: {
    y: {
      type: 'linear',
      display: true,
    },
    percentage: {
      type: 'linear',
      display: false,
      position: 'right',
      min: 0,
      max: 100,
      grid: {
        drawOnChartArea: false,
      },
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      reverse: true,
      labels: {
        filter: function(item, chart) {
          return !item.text.includes('Reproduction rate') 
            && !!chart.datasets[chart.datasets.findIndex(e => e.label === item.text)].data.length;
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
