import { IAlertRepository } from '../repositories/IAlertRepository';
import { RpcResult } from '../core/result/RpcResult';
import { Alert } from '../models/Alert';
import { CreateAlertRequest } from '../dto/requests/CreateAlertRequest';
import { SendAlertMessageRequest } from '../dto/requests/SendAlertMessageRequest';
import { AlertResponse } from '../dto/responses/AlertResponse';

export interface IAlertService {
  createAlert(req: CreateAlertRequest): Promise<RpcResult<AlertResponse>>;
  sendAlertMessage(req: SendAlertMessageRequest): Promise<RpcResult<any>>;
  getAlerts(): Promise<RpcResult<Alert[]>>;
}

export class AlertService implements IAlertService {
  private alertRepository: IAlertRepository;

  constructor(alertRepository: IAlertRepository) {
    this.alertRepository = alertRepository;
  }

  public async createAlert(req: CreateAlertRequest): Promise<RpcResult<AlertResponse>> {
    if (!req.type) {
      return { success: false, error: 'Alert type is required', status: 400 };
    }
    return this.alertRepository.createAlert(req);
  }

  public async sendAlertMessage(req: SendAlertMessageRequest): Promise<RpcResult<any>> {
    if (!req.message || req.message.trim() === '') {
      return { success: false, error: 'Message content cannot be empty', status: 400 };
    }
    return this.alertRepository.sendAlertMessage(req);
  }

  public async getAlerts(): Promise<RpcResult<Alert[]>> {
    return this.alertRepository.getAlerts();
  }
}
