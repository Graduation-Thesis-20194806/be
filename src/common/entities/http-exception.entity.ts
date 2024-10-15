export class HttpExceptionEntity {
  /**
   * Status Code
   * @example 500
   */
  status: number;
  /**
   * Error message
   * @example "Internal Server Error"
   */
  message: string;
}
