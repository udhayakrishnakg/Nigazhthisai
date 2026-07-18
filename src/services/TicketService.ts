import { ITicketRepository } from '../repositories/ITicketRepository';
import { RpcResult } from '../core/result/RpcResult';
import { Ticket } from '../models/Ticket';

export interface ITicketService {
  getUserTickets(userId: string): Promise<RpcResult<Ticket[]>>;
  verifyTicketQR(qrPayload: string): Promise<RpcResult<any>>;
}

export class TicketService implements ITicketService {
  private ticketRepository: ITicketRepository;

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository;
  }

  public async getUserTickets(userId: string): Promise<RpcResult<Ticket[]>> {
    const res = await this.ticketRepository.getTickets();
    if (res.success && res.data) {
      const filtered = res.data.filter(t => String(t.user_id) === String(userId));
      return { success: true, data: filtered, status: 200 };
    }
    return res;
  }

  public async verifyTicketQR(qrPayload: string): Promise<RpcResult<any>> {
    if (!qrPayload || qrPayload.trim() === '') {
      return { success: false, error: 'Invalid or empty QR code scanner data', status: 400 };
    }
    
    // Simulate verification
    if (qrPayload.includes('BK') || qrPayload.includes('TK') || qrPayload.includes('TKT')) {
      return {
        success: true,
        data: {
          valid: true,
          message: 'Ticket Validated Successfully',
          verifiedAt: new Date().toISOString()
        },
        status: 200
      };
    }
    
    return {
      success: true,
      data: {
        valid: false,
        message: 'Invalid or Expired Ticket Signature'
      },
      status: 200
    };
  }
}
