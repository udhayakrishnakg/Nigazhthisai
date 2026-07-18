export interface RpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}
