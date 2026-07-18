import { IBookingRepository } from '../repositories/IBookingRepository';
import { RpcResult } from '../core/result/RpcResult';
import { Booking } from '../models/Booking';
import { BookingRequest } from '../dto/requests/BookingRequest';
import { BookingResponse } from '../dto/responses/BookingResponse';

export interface IBookingService {
  bookTicket(req: BookingRequest): Promise<RpcResult<BookingResponse>>;
  getBookings(): Promise<RpcResult<Booking[]>>;
}

export class BookingService implements IBookingService {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  public async bookTicket(req: BookingRequest): Promise<RpcResult<BookingResponse>> {
    // Validate request logic
    if (req.seats <= 0) {
      return { success: false, error: 'Seats quantity must be at least 1', status: 400 };
    }
    if (req.amount <= 0) {
      return { success: false, error: 'Amount must be greater than zero', status: 400 };
    }
    return this.bookingRepository.book(req);
  }

  public async getBookings(): Promise<RpcResult<Booking[]>> {
    return this.bookingRepository.getBookings();
  }
}
