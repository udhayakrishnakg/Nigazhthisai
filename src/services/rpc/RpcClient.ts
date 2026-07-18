import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiRoutes } from '../../api/ApiRoutes';
import { RpcResult } from '../../core/result/RpcResult';

export class RpcClient {
  private supabase: SupabaseClient;

  constructor() {
    // @ts-ignore
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://anotsryyaynwntgfzscv.supabase.co';
    // @ts-ignore
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_O8WytfBLjE9MML11-8i3Ow_RcTjRlVa';
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  private async callRpc<T>(routeName: string, params?: any): Promise<RpcResult<T>> {
    try {
      const { data, error, status } = await this.supabase.rpc(routeName, params);
      if (error) {
        console.warn(`RPC error in ${routeName}:`, error);
        return {
          success: false,
          error: error.message,
          status: status || 500,
        };
      }
      return {
        success: true,
        data: data as T,
        status: status || 200,
      };
    } catch (err: any) {
      console.warn(`RPC network error in ${routeName}:`, err);
      return {
        success: false,
        error: err.message || 'Unknown network error',
        status: 500,
      };
    }
  }

  public async invokeFunction<T>(functionName: string, body?: any): Promise<RpcResult<T>> {
    try {
      const { data, error } = await this.supabase.functions.invoke(functionName, {
        body,
      });
      if (error) {
        return {
          success: false,
          error: error.message || 'Edge function error',
          status: 500,
        };
      }
      return {
        success: true,
        data: data as T,
        status: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unknown function error',
        status: 500,
      };
    }
  }

  public async bookTicket<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.BookTicket, params);
  }

  public async cancelTicket<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.CancelTicket, params);
  }

  public async startTrip<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.StartTrip, params);
  }

  public async endTrip<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.EndTrip, params);
  }

  public async getRoutes<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetRoutes);
  }

  public async getTrips<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetTrips);
  }

  public async sendAlert<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.CreateAlert, params);
  }

  public async sendMessage<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.SendAlertMessage, params);
  }

  public async getBookings<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetBookings);
  }

  public async login<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.Login, params);
  }

  public async getUserProfile<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetUserProfile);
  }

  public async getBuses<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetBuses);
  }

  public async getStops<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetStops);
  }

  public async getEtms<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetEtms);
  }

  public async getComplaints<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetComplaints);
  }

  public async getAlerts<T>(): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.GetAlerts);
  }

  public async updateBusLocation<T>(params: any): Promise<RpcResult<T>> {
    return this.callRpc<T>(ApiRoutes.UpdateBusLocation, params);
  }
}

// Single instance export for convenience
export const rpcClientInstance = new RpcClient();
