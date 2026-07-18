import { Booking } from '../../models/Booking';

export interface BookingResponse {
  booking: Booking;
  payment_url?: string;
}
