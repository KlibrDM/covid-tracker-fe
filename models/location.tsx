const LocationTypes = [
  "country",
  "region",
  "other",
  "owidcat"
];
export type LocationType = typeof LocationTypes[number];

export interface ILocation {
  code: string;
  continent?: string;
  name: string;
  type: LocationType;
  population?: number;
  population_density?: number;
  median_age?: number;
  aged_65_older?: number;
  hospital_beds_per_thousand?: number;
}
