export interface ICustomLocation {
  ownerId: string;
  is_public: boolean;
  code: string;
  name: string;
  parent_code?: string;
  available_indicators?: string[];
  population?: number;
  population_density?: number;
  median_age?: number;
  aged_65_older?: number;
  hospital_beds_per_thousand?: number;
}
