export interface Bus {
  id: string;
  registration_number: string;
  capacity?: number;
  current_lat?: number;
  current_lng?: number;
  route_id?: number;
  status: string;
  model?: string;
  type?: string;
  etm_id?: string;
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
  district?: number;
}
