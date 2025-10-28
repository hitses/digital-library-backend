import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, [] as const),
) {}
