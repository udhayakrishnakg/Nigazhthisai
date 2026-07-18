export interface Ticket {
  id: string;
  user_id: string;
  bus_id: string;
  status: string;
  seats: number;
  date: string;
  timestamp: string;
  order_id?: string;
  origin_stop_id?: string;
  destination_stop_id?: string;
  channel?: string;
  created_at?: string;
  updated_at?: string;
}
