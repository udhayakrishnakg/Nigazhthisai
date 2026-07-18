import { IBusRepository } from '../repositories/IBusRepository';
import { RpcResult } from '../core/result/RpcResult';
import { Bus } from '../models/Bus';

export interface IBusService {
  getBuses(): Promise<RpcResult<Bus[]>>;
  updateBusLocation(busId: string, lat: number, lng: number): Promise<RpcResult<any>>;
}

export class BusService implements IBusService {
  private busRepository: IBusRepository;

  constructor(busRepository: IBusRepository) {
    this.busRepository = busRepository;
  }

  public async getBuses(): Promise<RpcResult<Bus[]>> {
    return this.busRepository.getBuses();
  }

  public async updateBusLocation(busId: string, lat: number, lng: number): Promise<RpcResult<any>> {
    if (!busId) {
      return { success: false, error: 'Bus ID is required to update its location', status: 400 };
    }
    return this.busRepository.updateLocation(busId, lat, lng);
  }
}
