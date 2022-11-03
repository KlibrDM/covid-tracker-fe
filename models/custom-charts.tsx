export type ChartType = "line" | "area" | "bar";
export const ChartTypes: ChartType[] = [
  "line",
  "area",
  "bar"
];

export interface IChartAreaFill {
  target: string,
  above: string,
  below: string
}

export interface IIndicatorSettings {
  key: string,
  label: string,
  per_million?: boolean,
  average?: 7 | 14,
}

export interface IChartValue {
  indicator: IIndicatorSettings;
  location_code: string;
  chart_type: "area" | "line" | "bar";
  color: string;
  fill?: IChartAreaFill;
}

export interface IChart {
  ownerId: string;
  is_public: boolean;
  name: string;
  start_date: Date;
  end_date: Date;
  values: IChartValue[];
}

export interface IIndicator {
  group: string;
  key: string;
  label: string;
}

export const IndicatorGroups = [
  "cases",
  "deaths",
  "tests",
  "vaccinations",
  "hospitalizations",
  "other"
];

export const Indicators: IIndicator[] = [
  {
    group: "cases",
    key: "new_cases",
    label: "New Cases"
  },
  {
    group: "cases",
    key: "total_cases",
    label: "Total Cases"
  },
  {
    group: "cases",
    key: "reproduction_rate",
    label: "Reproduction Rate"
  },
  {
    group: "deaths",
    key: "new_deaths",
    label: "New Deaths"
  },
  {
    group: "deaths",
    key: "total_deaths",
    label: "Total Deaths"
  }, 
  {
    group: "deaths",
    key: "excess_mortality",
    label: "Excess Mortality"
  },
  {
    group: "deaths",
    key: "excess_mortality_cumulative",
    label: "Excess Mortality Cumulative"
  },
  {
    group: "tests",
    key: "new_tests",
    label: "New Tests"
  },
  {
    group: "tests",
    key: "total_tests",
    label: "Total Tests"
  },
  {
    group: "tests",
    key: "positive_rate",
    label: "Positive Rate"
  },
  {
    group: "vaccinations",
    key: "new_vaccinations",
    label: "New Vaccinations"
  },
  {
    group: "vaccinations",
    key: "total_vaccinations",
    label: "Total Vaccinations"
  },
  {
    group: "vaccinations",
    key: "people_vaccinated",
    label: "People Vaccinated"
  },
  {
    group: "vaccinations",
    key: "people_fully_vaccinated",
    label: "People Fully Vaccinated"
  },
  {
    group: "vaccinations",
    key: "total_boosters",
    label: "Total Boosters"
  },
  {
    group: "hospitalizations",
    key: "icu_patients",
    label: "ICU Patients"
  },
  {
    group: "hospitalizations",
    key: "hosp_patients",
    label: "Hospital Patients"
  },
  {
    group: "hospitalizations",
    key: "weekly_icu_admissions",
    label: "Weekly ICU Admissions"
  },
  {
    group: "hospitalizations",
    key: "weekly_hosp_admissions",
    label: "Weekly Hospital Admissions"
  },
  {
    group: "other",
    key: "stringency_index",
    label: "Stringency Index"
  }
];
