export interface Booking {
  id: string;
  bus_id: string;
  user_id: string;
  seats: number;
  amount: number;
  status: string;
  from_stop: string;
  to_stop: string;
  transaction_id?: string;
  created_at?: string;
  updated_at?: string;
}
