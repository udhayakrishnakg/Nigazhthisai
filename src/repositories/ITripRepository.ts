import { RpcResult } from '../core/result/RpcResult';
import { Trip } from '../models/Trip';
import { StartTripRequest } from '../dto/requests/StartTripRequest';
import { EndTripRequest } from '../dto/requests/EndTripRequest';
import { TripResponse } from '../dto/responses/TripResponse';

export interface ITripRepository {
  startTrip(req: StartTripRequest): Promise<RpcResult<TripResponse>>;
  endTrip(req: EndTripRequest): Promise<RpcResult<TripResponse>>;
  getTrips(): Promise<RpcResult<Trip[]>>;
}
