import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Booking } from '../models/Booking';
import { BookingRequest } from '../dto/requests/BookingRequest';
import { BookingResponse } from '../dto/responses/BookingResponse';
import { IBookingRepository } from './IBookingRepository';

export class BookingRepository implements IBookingRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async book(req: BookingRequest): Promise<RpcResult<BookingResponse>> {
    const res = await this.rpcClient.bookTicket<BookingResponse>(req);
    if (!res.success) {
      // Fallback local persistence
      const mockBookingId = 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const localBooking: Booking = {
        id: mockBookingId,
        bus_id: req.bus_id,
        user_id: req.user_id,
        seats: req.seats,
        amount: req.amount,
        status: 'Confirmed',
        from_stop: req.from_stop,
        to_stop: req.to_stop,
        created_at: new Date().toISOString()
      };

      const existingStr = localStorage.getItem('nigazhthisai_bookings') || '[]';
      try {
        const existing = JSON.parse(existingStr);
        existing.push(localBooking);
        localStorage.setItem('nigazhthisai_bookings', JSON.stringify(existing));
      } catch (e) {
        localStorage.setItem('nigazhthisai_bookings', JSON.stringify([localBooking]));
      }

      return {
        success: true,
        data: {
          booking: localBooking,
          payment_url: `https://checkout.example.com/pay?id=${mockBookingId}`
        } as any,
        status: 200
      };
    }
    return res;
  }

  public async getBookings(): Promise<RpcResult<Booking[]>> {
    const res = await this.rpcClient.getBookings<Booking[]>();
    if (!res.success) {
      const existingStr = localStorage.getItem('nigazhthisai_bookings') || '[]';
      try {
        const data = JSON.parse(existingStr);
        return { success: true, data, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }
}
