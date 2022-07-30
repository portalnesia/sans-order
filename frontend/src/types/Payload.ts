export interface Payload<T,E=any> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  };
  error?: {
    status: number,
    name: string,
    message: string,
    details: E
  }
}
