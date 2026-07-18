import { User } from '../../models/User';

export interface LoginResponse {
  user: User;
  token: string;
}
