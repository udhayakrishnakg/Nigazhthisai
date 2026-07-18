import { RpcResult } from '../core/result/RpcResult';
import { Alert } from '../models/Alert';
import { CreateAlertRequest } from '../dto/requests/CreateAlertRequest';
import { SendAlertMessageRequest } from '../dto/requests/SendAlertMessageRequest';
import { AlertResponse } from '../dto/responses/AlertResponse';

export interface IAlertRepository {
  createAlert(req: CreateAlertRequest): Promise<RpcResult<AlertResponse>>;
  sendAlertMessage(req: SendAlertMessageRequest): Promise<RpcResult<any>>;
  getAlerts(): Promise<RpcResult<Alert[]>>;
}
