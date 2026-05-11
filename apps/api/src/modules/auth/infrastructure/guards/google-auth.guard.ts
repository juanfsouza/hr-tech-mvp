import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const response = context.switchToHttp().getResponse();

    if (!response.setHeader && response.raw) {
      response.setHeader = (name: string, value: any) => {
        response.raw.setHeader(name, value);
        return response;
      };
    }

    if (!response.end && response.raw) {
      response.end = (chunk?: Buffer) => {
        response.raw.end(chunk);
        return response;
      };
    }

    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
