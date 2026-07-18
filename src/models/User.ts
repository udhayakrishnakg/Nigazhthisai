import { UserRole } from './UserRole';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: string;
  scope?: string;
  created_at?: string;
}
