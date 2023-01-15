export interface ISimulationParameter {
  key: string;
  value: number;
}

export interface ISimulationQuery {
  ownerId: string;
  location_code: string;
  start_date: Date;
  dataset_location_codes: string[];
  simulation_parameters: ISimulationParameter[];
}

export interface ISimulationResultSummary {
  total_new_cases: number;
  total_new_deaths: number;
  peak_new_cases: number;
  peak_new_deaths: number;
  peak_icu_patients: number;
  peak_hosp_patients: number;
}

export interface ISimulation {
  ownerId: string;
  is_public: boolean;
  name: string;
  location_code: string;
  start_date: Date;
  dataset_location_codes: string[];
  simulation_parameters: ISimulationParameter[];
  total_cases: number[];
  new_cases: number[];
  total_deaths: number[];
  new_deaths: number[];
  icu_patients: number[];
  hosp_patients: number[];
}
