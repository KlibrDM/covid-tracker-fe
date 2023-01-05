import { ChartConfiguration } from "chart.js";
import { IChart } from "./custom-chart";

export interface IReport {
  ownerId?: string;
  is_public: boolean;
  name: string;
  charts: IChart[];
}

export interface IReportChart {
  name: string;
  config: ChartConfiguration;
}
