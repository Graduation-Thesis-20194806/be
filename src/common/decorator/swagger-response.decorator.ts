import { ApiResponseOptions } from '@nestjs/swagger';

import { HttpExceptionEntity } from '../entities/http-exception.entity';

export function SwaggerResponse(
  ApiResponse: (
    options?: ApiResponseOptions,
  ) => MethodDecorator & ClassDecorator,
  options: ApiResponseOptions = {},
) {
  return ApiResponse({ type: HttpExceptionEntity, ...options });
}
