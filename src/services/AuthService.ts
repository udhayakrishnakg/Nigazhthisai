import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CurrentUser } from '../models/CurrentUser';
import { UserRole } from '../models/UserRole';
import { RpcResult } from '../core/result/RpcResult';

export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    // @ts-ignore
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://anotsryyaynwntgfzscv.supabase.co';
    // @ts-ignore
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_O8WytfBLjE9MML11-8i3Ow_RcTjRlVa';
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public async getCurrentUser(): Promise<RpcResult<CurrentUser>> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error || !session || !session.user) {
        return { success: false, error: 'No active session found', status: 401 };
      }

      // Query from public.users to get the most up-to-date name, phone, role
      const { data: profile } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const rawRole = profile?.role || session.user.user_metadata?.role || 'PASSENGER';
      let mappedRole = UserRole.Passenger;

      if (rawRole === 'DRIVER') mappedRole = UserRole.Driver;
      else if (rawRole === 'CONDUCTOR') mappedRole = UserRole.Conductor;
      else if (rawRole === 'ADMIN' || rawRole === 'MASTER_ADMIN' || rawRole === 'OPERATIONS') mappedRole = UserRole.Admin;
      else if (rawRole === 'INSPECTOR') mappedRole = UserRole.Inspector;

      const user: CurrentUser = {
        id: session.user.id,
        name: profile?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: mappedRole,
        mobile: profile?.phone || session.user.phone || '',
        token: session.access_token
      };

      return { success: true, data: user, status: 200 };
    } catch (e: any) {
      return { success: false, error: e.message || 'Session verification failed', status: 500 };
    }
  }

  public async logout(): Promise<RpcResult<boolean>> {
    try {
      await this.supabase.auth.signOut();
      localStorage.removeItem('nigazhthisai_current_user');
      return { success: true, data: true, status: 200 };
    } catch (e: any) {
      return { success: false, error: e.message, status: 500 };
    }
  }
}

export const authServiceInstance = new AuthService();
