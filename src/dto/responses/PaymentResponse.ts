export interface PaymentResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
}
