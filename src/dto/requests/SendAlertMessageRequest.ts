export interface SendAlertMessageRequest {
  alert_id: number;
  sender_role: string;
  sender_name?: string;
  message: string;
}
