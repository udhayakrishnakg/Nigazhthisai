import { RpcClient } from '../services/rpc/RpcClient';
import { RpcResult } from '../core/result/RpcResult';
import { Alert } from '../models/Alert';
import { CreateAlertRequest } from '../dto/requests/CreateAlertRequest';
import { SendAlertMessageRequest } from '../dto/requests/SendAlertMessageRequest';
import { AlertResponse } from '../dto/responses/AlertResponse';
import { IAlertRepository } from './IAlertRepository';

export class AlertRepository implements IAlertRepository {
  private rpcClient: RpcClient;

  constructor(rpcClient: RpcClient) {
    this.rpcClient = rpcClient;
  }

  public async createAlert(req: CreateAlertRequest): Promise<RpcResult<AlertResponse>> {
    const res = await this.rpcClient.sendAlert<AlertResponse>(req);
    if (!res.success) {
      // Local storage fallback for the SOS/Alert system
      const storedAlertsStr = localStorage.getItem('nigazhthisai_alerts') || '[]';
      try {
        const alerts = JSON.parse(storedAlertsStr);
        const newAlert: Alert = {
          id: alerts.length + 1,
          type: req.type,
          message: req.message,
          bus_id: req.bus_id,
          idle_duration: req.idle_duration,
          location: req.location,
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        };
        alerts.push(newAlert);
        localStorage.setItem('nigazhthisai_alerts', JSON.stringify(alerts));
        return {
          success: true,
          data: { alert: newAlert } as AlertResponse,
          status: 200
        };
      } catch (e) {
        return { success: false, error: 'Failed to access local alerts storage', status: 500 };
      }
    }
    return res;
  }

  public async sendAlertMessage(req: SendAlertMessageRequest): Promise<RpcResult<any>> {
    const res = await this.rpcClient.sendMessage<any>(req);
    if (!res.success) {
      const storedMessagesStr = localStorage.getItem('nigazhthisai_alert_messages') || '[]';
      try {
        const messages = JSON.parse(storedMessagesStr);
        const newMessage = {
          id: messages.length + 1,
          alert_id: req.alert_id,
          sender_role: req.sender_role,
          sender_name: req.sender_name,
          message: req.message,
          created_at: new Date().toISOString()
        };
        messages.push(newMessage);
        localStorage.setItem('nigazhthisai_alert_messages', JSON.stringify(messages));
        return { success: true, data: newMessage, status: 200 };
      } catch (e) {
        return { success: false, error: 'Failed to access local messages storage', status: 500 };
      }
    }
    return res;
  }

  public async getAlerts(): Promise<RpcResult<Alert[]>> {
    const res = await this.rpcClient.getAlerts<Alert[]>();
    if (!res.success) {
      const storedAlertsStr = localStorage.getItem('nigazhthisai_alerts') || '[]';
      try {
        const alerts = JSON.parse(storedAlertsStr);
        return { success: true, data: alerts, status: 200 };
      } catch (e) {
        return { success: true, data: [], status: 200 };
      }
    }
    return res;
  }
}
