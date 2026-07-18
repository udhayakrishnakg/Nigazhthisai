import { RpcResult } from '../core/result/RpcResult';
import { Bus } from '../models/Bus';

export interface IBusRepository {
  getBuses(): Promise<RpcResult<Bus[]>>;
  updateLocation(busId: string, lat: number, lng: number): Promise<RpcResult<any>>;
}
