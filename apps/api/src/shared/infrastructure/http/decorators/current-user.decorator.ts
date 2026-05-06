import { AuthenticatedUser } from '@/interfaces/authenticated-user.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: AuthenticatedUser }>();
    return request.user;
  },
);
export { AuthenticatedUser };

