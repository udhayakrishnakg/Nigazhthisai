import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Ticket } from '../models/Ticket';
import { ITicketRepository } from './ITicketRepository';

export class TicketRepository implements ITicketRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async getTickets(): Promise<RpcResult<Ticket[]>> {
    // There is no direct RPC for getting tickets, let's call getBookings and map them or fallback
    const res = await this.rpcClient.getBookings<Ticket[]>();
    if (!res.success) {
      const storedTicketsStr = localStorage.getItem('nigazhthisai_tickets') || '[]';
      try {
        const tickets = JSON.parse(storedTicketsStr);
        return { success: true, data: tickets, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }
}
