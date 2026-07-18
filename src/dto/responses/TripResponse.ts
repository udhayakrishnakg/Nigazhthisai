import { Trip } from '../../models/Trip';

export interface TripResponse {
  trip: Trip;
  route_name?: string;
  bus_registration?: string;
}
