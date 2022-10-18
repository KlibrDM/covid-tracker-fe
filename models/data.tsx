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
}
