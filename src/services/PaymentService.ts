import { IPaymentRepository } from '../repositories/IPaymentRepository';
import { RpcResult } from '../core/result/RpcResult';

export interface IPaymentService {
  initiatePayment(amount: number, userId: string): Promise<RpcResult<any>>;
  confirmPayment(orderId: string, paymentId: string, signature: string): Promise<RpcResult<any>>;
}

export class PaymentService implements IPaymentService {
  private paymentRepository: IPaymentRepository;

  constructor(paymentRepository: IPaymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  public async initiatePayment(amount: number, userId: string): Promise<RpcResult<any>> {
    if (amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero', status: 400 };
    }
    return this.paymentRepository.createOrder(amount, userId);
  }

  public async confirmPayment(orderId: string, paymentId: string, signature: string): Promise<RpcResult<any>> {
    if (!orderId || !paymentId) {
      return { success: false, error: 'Invalid transaction identifiers', status: 400 };
    }
    return this.paymentRepository.verifyPayment(orderId, paymentId, signature);
  }
}
