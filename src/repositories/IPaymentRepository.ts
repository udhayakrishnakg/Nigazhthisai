import { RpcResult } from '../core/result/RpcResult';

export interface IPaymentRepository {
  createOrder(amount: number, userId: string): Promise<RpcResult<any>>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<RpcResult<any>>;
}
