import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Route } from '../models/Route';
import { IRouteRepository } from './IRouteRepository';

export class RouteRepository implements IRouteRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async getRoutes(): Promise<RpcResult<Route[]>> {
    const res = await this.rpcClient.getRoutes<Route[]>();
    if (!res.success) {
      const storedRoutesStr = localStorage.getItem('nigazhthisai_routes') || '[]';
      try {
        const routes = JSON.parse(storedRoutesStr);
        return { success: true, data: routes, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }
}
