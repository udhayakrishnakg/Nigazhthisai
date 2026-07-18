export interface Alert {
  id: number;
  type: string;
  message?: string;
  bus_id?: string;
  idle_duration?: number;
  location?: any;
  status?: string;
  user_id?: string;
  created_at?: string;
}
