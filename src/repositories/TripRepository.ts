import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Trip } from '../models/Trip';
import { StartTripRequest } from '../dto/requests/StartTripRequest';
import { EndTripRequest } from '../dto/requests/EndTripRequest';
import { TripResponse } from '../dto/responses/TripResponse';
import { ITripRepository } from './ITripRepository';

export class TripRepository implements ITripRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async startTrip(req: StartTripRequest): Promise<RpcResult<TripResponse>> {
    const res = await this.rpcClient.startTrip<TripResponse>(req);
    if (!res.success) {
      // Local storage fallback for the simulated driver/conductor flow
      const storedTripsStr = localStorage.getItem('nigazhthisai_trips') || '[]';
      try {
        let trips = JSON.parse(storedTripsStr);
        let found = trips.find((t: any) => String(t.id) === String(req.trip_id));
        if (found) {
          found.status = 'RUNNING';
          found.driver_id = req.driver_id;
          found.trip_start_lat = req.start_lat;
          found.trip_start_lng = req.start_lng;
          found.actual_start_time = new Date().toISOString();
        } else {
          // create mock trip if it doesn't exist
          found = {
            id: req.trip_id,
            status: 'RUNNING',
            driver_id: req.driver_id,
            trip_start_lat: req.start_lat,
            trip_start_lng: req.start_lng,
            actual_start_time: new Date().toISOString()
          };
          trips.push(found);
        }
        localStorage.setItem('nigazhthisai_trips', JSON.stringify(trips));
        return {
          success: true,
          data: { trip: found } as TripResponse,
          status: 200
        };
      } catch (e) {
        return { success: false, error: 'Failed to access local trip storage', status: 500 };
      }
    }
    return res;
  }

  public async endTrip(req: EndTripRequest): Promise<RpcResult<TripResponse>> {
    const res = await this.rpcClient.endTrip<TripResponse>(req);
    if (!res.success) {
      const storedTripsStr = localStorage.getItem('nigazhthisai_trips') || '[]';
      try {
        let trips = JSON.parse(storedTripsStr);
        let found = trips.find((t: any) => String(t.id) === String(req.trip_id));
        if (found) {
          found.status = 'COMPLETED';
          found.trip_end_lat = req.end_lat;
          found.trip_end_lng = req.end_lng;
          found.end_time = new Date().toISOString();
          localStorage.setItem('nigazhthisai_trips', JSON.stringify(trips));
          return {
            success: true,
            data: { trip: found } as TripResponse,
            status: 200
          };
        }
        return { success: false, error: 'Trip not found locally', status: 404 };
      } catch (e) {
        return { success: false, error: 'Failed to update local trip', status: 500 };
      }
    }
    return res;
  }

  public async getTrips(): Promise<RpcResult<Trip[]>> {
    const res = await this.rpcClient.getTrips<Trip[]>();
    if (!res.success) {
      const storedTripsStr = localStorage.getItem('nigazhthisai_trips') || '[]';
      try {
        const trips = JSON.parse(storedTripsStr);
        return { success: true, data: trips, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }
}
