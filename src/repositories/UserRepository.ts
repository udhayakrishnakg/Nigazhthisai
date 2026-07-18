import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { User } from '../models/User';
import { LoginRequest } from '../dto/requests/LoginRequest';
import { LoginResponse } from '../dto/responses/LoginResponse';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async login(req: LoginRequest): Promise<RpcResult<LoginResponse>> {
    return this.rpcClient.login<LoginResponse>(req);
  }

  public async getUserProfile(): Promise<RpcResult<User>> {
    return this.rpcClient.getUserProfile<User>();
  }
}
