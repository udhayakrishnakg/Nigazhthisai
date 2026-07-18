import { ITripRepository } from '../repositories/ITripRepository';
import { RpcResult } from '../core/result/RpcResult';
import { Trip } from '../models/Trip';
import { StartTripRequest } from '../dto/requests/StartTripRequest';
import { EndTripRequest } from '../dto/requests/EndTripRequest';
import { TripResponse } from '../dto/responses/TripResponse';

export interface ITripService {
  startTrip(req: StartTripRequest): Promise<RpcResult<TripResponse>>;
  endTrip(req: EndTripRequest): Promise<RpcResult<TripResponse>>;
  getTrips(): Promise<RpcResult<Trip[]>>;
}

export class TripService implements ITripService {
  private tripRepository: ITripRepository;

  constructor(tripRepository: ITripRepository) {
    this.tripRepository = tripRepository;
  }

  public async startTrip(req: StartTripRequest): Promise<RpcResult<TripResponse>> {
    if (!req.trip_id) {
      return { success: false, error: 'Trip ID is required to start a trip', status: 400 };
    }
    return this.tripRepository.startTrip(req);
  }

  public async endTrip(req: EndTripRequest): Promise<RpcResult<TripResponse>> {
    if (!req.trip_id) {
      return { success: false, error: 'Trip ID is required to end a trip', status: 400 };
    }
    return this.tripRepository.endTrip(req);
  }

  public async getTrips(): Promise<RpcResult<Trip[]>> {
    return this.tripRepository.getTrips();
  }
}
