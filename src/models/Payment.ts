export interface Payment {
  id: string;
  order_id: string;
  signature?: string;
  status: string;
  created_at?: string;
}
