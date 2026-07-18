export interface AlertMessage {
  id: number;
  alert_id: number;
  sender_role: string;
  sender_name?: string;
  message: string;
  created_at?: string;
}
