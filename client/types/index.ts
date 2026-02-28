export type UserRole = "student" | "driver" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  role: UserRole;
  phone: string;
}

export interface Student {
  id: number;
  user: User;
  student_id: string;
  home_lat: number | null;
  home_lon: number | null;
  bus_id: number | null;
}

export interface Driver {
  id: number;
  user: User;
  employee_id: string;
  license_id: string;
}

export interface Bus {
  id: number;
  name: string;
  registration_number: string;
  driver_id: number | null;
  driver?: Driver;
  capacity: number | null;
  is_active: boolean;
  route?: Route;
}

export interface Route {
  id: number;
  route_str: string;
  path: Array<[number, number]>;
}

export interface BusLocation {
  lat: number;
  lng: number;
  timestamp: number;
  heading?: number;
  speed?: number;
}

export interface AuthState {
  user: User | null;
  student: Student | null;
  driver: Driver | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  student?: Student;
  driver?: Driver;
}
