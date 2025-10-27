import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,20}$/, {
    message:
      'Password must have an uppercase, a lowercase, and a number character',
  })
  newPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,20}$/, {
    message:
      'Password must have an uppercase, a lowercase, and a number character',
  })
  oldPassword: string;
}
