import { RpcResult } from '../core/result/RpcResult';
import { Booking } from '../models/Booking';
import { BookingRequest } from '../dto/requests/BookingRequest';
import { BookingResponse } from '../dto/responses/BookingResponse';

export interface IBookingRepository {
  book(req: BookingRequest): Promise<RpcResult<BookingResponse>>;
  getBookings(): Promise<RpcResult<Booking[]>>;
}
