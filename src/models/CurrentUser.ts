import { UserRole } from './UserRole';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile?: string;
  token?: string;
}
