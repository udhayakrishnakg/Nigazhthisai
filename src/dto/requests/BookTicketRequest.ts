export interface BookTicketRequest {
  bus_id: string;
  source_stop_id: string;
  destination_stop_id: string;
  num_seats: number;
  user_id: string;
  amount: number;
}
