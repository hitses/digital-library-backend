import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export const createErrorResponse = (model: string, error: any) => {
  if (error.code === 11000)
    throw new BadRequestException(`${model} already exists`);

  throw new InternalServerErrorException(`Error creating ${model}: ${error}`);
};

export const updateErrorResponse = (model: string, error: any) => {
  if (error.code === 11000)
    throw new BadRequestException(`${model} already exists`);

  throw new InternalServerErrorException(`Error updating ${model}: ${error}`);
};
