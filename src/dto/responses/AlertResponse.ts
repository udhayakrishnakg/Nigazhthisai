import { Alert } from '../../models/Alert';

export interface AlertResponse {
  alert: Alert;
  bus_registration?: string;
}
