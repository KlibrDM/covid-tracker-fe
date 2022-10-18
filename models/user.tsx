const RoleTypes = [
  "admin",
  "pro",
  "user"
];
export type RoleType = typeof RoleTypes[number];

export interface IUser{
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  role: RoleType;
  location_code: string;
  token?: string;
}
