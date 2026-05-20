export class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}

export const ok = (data, message = 'Success', meta) => new ApiResponse(200, data, message, meta);
export const created = (data, message = 'Created', meta) => new ApiResponse(201, data, message, meta);
