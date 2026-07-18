import { RpcResult } from '../core/result/RpcResult';
import { Route } from '../models/Route';

export interface IRouteRepository {
  getRoutes(): Promise<RpcResult<Route[]>>;
}
