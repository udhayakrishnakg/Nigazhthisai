import { RpcResult } from '../core/result/RpcResult';
import { User } from '../models/User';
import { LoginRequest } from '../dto/requests/LoginRequest';
import { LoginResponse } from '../dto/responses/LoginResponse';

export interface IUserRepository {
  login(req: LoginRequest): Promise<RpcResult<LoginResponse>>;
  getUserProfile(): Promise<RpcResult<User>>;
}
