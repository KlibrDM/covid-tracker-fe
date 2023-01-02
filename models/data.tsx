export interface IData {
  location_code: string;
  location_name?: string;
  date: Date;
  total_cases?: number;
  new_cases?: number;
  total_deaths?: number;
  new_deaths?: number;
  reproduction_rate?: number;
  icu_patients?: number;
  hosp_patients?: number;
  weekly_icu_admissions?: number;
  weekly_hosp_admissions?: number;
  total_tests?: number;
  new_tests?: number;
  positive_rate?: number;
  test_units?: string;
  total_vaccinations?: number;
  people_vaccinated?: number;
  people_fully_vaccinated?: number;
  total_boosters?: number;
  new_vaccinations?: number;
  stringency_index?: number;
  excess_mortality?: number;
  excess_mortality_cumulative?: number;
}

export const INDICATOR_LABELS: Map<string, string> = new Map([
  ['date', 'Date'],
  ['total_cases', 'Total Cases'],
  ['new_cases', 'New Cases'],
  ['total_deaths', 'Total Deaths'],
  ['new_deaths', 'New Deaths'],
  ['reproduction_rate', 'Reproduction Rate'],
  ['icu_patients', 'ICU Patients'],
  ['hosp_patients', 'Hospital Patients'],
  ['weekly_icu_admissions', 'Weekly ICU Admissions'],
  ['weekly_hosp_admissions', 'Weekly Hospital Admissions'],
  ['total_tests', 'Total Tests'],
  ['new_tests', 'New Tests'],
  ['positive_rate', 'Positive Rate'],
  ['test_units', 'Test Units'],
  ['total_vaccinations', 'Total Vaccinations'],
  ['people_vaccinated', 'People Vaccinated'],
  ['people_fully_vaccinated', 'People Fully Vaccinated'],
  ['total_boosters', 'Total Boosters'],
  ['new_vaccinations', 'New Vaccinations'],
  ['stringency_index', 'Stringency Index'],
  ['excess_mortality', 'Excess Mortality'],
  ['excess_mortality_cumulative', 'Excess Mortality Cumulative'],
]);
