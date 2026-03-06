import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserFromJwt {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserFromJwt | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
