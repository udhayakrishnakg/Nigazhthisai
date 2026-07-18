import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Bus } from '../models/Bus';
import { IBusRepository } from './IBusRepository';

export class BusRepository implements IBusRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async getBuses(): Promise<RpcResult<Bus[]>> {
    const res = await this.rpcClient.getBuses<Bus[]>();
    if (!res.success) {
      const storedBusesStr = localStorage.getItem('nigazhthisai_buses') || '[]';
      try {
        const buses = JSON.parse(storedBusesStr);
        return { success: true, data: buses, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }

  public async updateLocation(busId: string, lat: number, lng: number): Promise<RpcResult<any>> {
    const res = await this.rpcClient.updateBusLocation<any>({ bus_id: busId, lat, lng });
    if (!res.success) {
      // Local fallback
      const storedBusesStr = localStorage.getItem('nigazhthisai_buses') || '[]';
      try {
        let buses = JSON.parse(storedBusesStr);
        buses = buses.map((b: any) => {
          if (String(b.id) === String(busId)) {
            return { ...b, current_lat: lat, current_lng: lng, last_updated: new Date().toISOString() };
          }
          return b;
        });
        localStorage.setItem('nigazhthisai_buses', JSON.stringify(buses));
        return { success: true, data: { success: true }, status: 200 };
      } catch (e) {
        return { success: false, error: 'Failed to update local bus location', status: 500 };
      }
    }
    return res;
  }
}
