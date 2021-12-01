import {
  applyDecorators,
  ClassSerializerInterceptor,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

export function UseGqlSerializer() {
  return applyDecorators(
    UseInterceptors(ClassSerializerInterceptor),
    SerializeOptions({ groups: ['graphql'] }),
  );
}
