export interface BookingRequest {
  bus_id: string;
  user_id: string;
  from_stop: string;
  to_stop: string;
  seats: number;
  amount: number;
}
