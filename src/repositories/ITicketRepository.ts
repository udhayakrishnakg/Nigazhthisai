import { RpcResult } from '../core/result/RpcResult';
import { Ticket } from '../models/Ticket';

export interface ITicketRepository {
  getTickets(): Promise<RpcResult<Ticket[]>>;
}
