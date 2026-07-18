import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Complaint } from '../models/Complaint';
import { CreateComplaintRequest } from '../dto/requests/CreateComplaintRequest';
import { IComplaintRepository } from './IComplaintRepository';

export class ComplaintRepository implements IComplaintRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async createComplaint(req: CreateComplaintRequest): Promise<RpcResult<any>> {
    // There is no direct RPC for creating a complaint listed, but we have getComplaints.
    // Let's assume there is a mock fallback or an RPC we can invoke.
    const res = await this.rpcClient.invokeFunction<any>('create_complaint', req);
    if (!res.success) {
      const storedComplaintsStr = localStorage.getItem('nigazhthisai_complaints') || '[]';
      try {
        const complaints = JSON.parse(storedComplaintsStr);
        const newComplaint = {
          id: complaints.length + 1,
          bus_id: req.busId,
          type: req.type,
          description: req.description,
          created_at: new Date().toISOString()
        };
        complaints.push(newComplaint);
        localStorage.setItem('nigazhthisai_complaints', JSON.stringify(complaints));
        return { success: true, data: newComplaint, status: 200 };
      } catch (e) {
        return { success: false, error: 'Failed to access local complaints storage', status: 500 };
      }
    }
    return res;
  }

  public async getComplaints(): Promise<RpcResult<Complaint[]>> {
    const res = await this.rpcClient.getComplaints<Complaint[]>();
    if (!res.success) {
      const storedComplaintsStr = localStorage.getItem('nigazhthisai_complaints') || '[]';
      try {
        const complaints = JSON.parse(storedComplaintsStr);
        return { success: true, data: complaints, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }
}
