import { RpcResult } from '../core/result/RpcResult';
import { Complaint } from '../models/Complaint';
import { CreateComplaintRequest } from '../dto/requests/CreateComplaintRequest';

export interface IComplaintRepository {
  createComplaint(req: CreateComplaintRequest): Promise<RpcResult<any>>;
  getComplaints(): Promise<RpcResult<Complaint[]>>;
}
