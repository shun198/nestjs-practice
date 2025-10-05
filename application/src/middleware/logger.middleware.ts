// logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, originalUrl } = request;
    response.on('finish', () => {
      const { statusCode } = response;
      this.logger.log(`${ip} ${method} ${originalUrl} ${statusCode}`);
    });
    next();
  }
}

