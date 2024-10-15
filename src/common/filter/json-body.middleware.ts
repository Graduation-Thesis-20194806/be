import { Injectable, NestMiddleware } from '@nestjs/common';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    if (bodyParser) bodyParser.json({ limit: '50mb' })(req, res, next);
    else next();
  }
}
