export interface Trip {
  id: string;
  route_id?: number;
  bus_id?: string;
  driver_id?: string;
  conductor_id?: string;
  status: string;
  last_gps_time?: string;
  driver_ended?: boolean;
  conductor_ended?: boolean;
  trip_start_lat?: number;
  trip_start_lng?: number;
  trip_end_lat?: number;
  trip_end_lng?: number;
  gps_verified?: boolean;
  actual_start_time?: string;
  start_time?: string;
  end_time?: string;
  district?: number;
  created_at?: string;
  updated_at?: string;
}
