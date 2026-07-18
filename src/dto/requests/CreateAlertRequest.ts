export interface CreateAlertRequest {
  type: string;
  message: string;
  bus_id?: string;
  idle_duration?: number;
  location?: any;
}
