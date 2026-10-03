import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {}; //as fileds are optional for UpdateUserDto

// manual version looks like this:
// export class UpdateUserDto {                                
//   @IsOptional() @IsString() @IsNotEmpty() @MinLength(3)
//   name?: string;

//   @IsOptional() @IsEmail()
//   email?: string;

//   @IsOptional() @IsEnum(UserRole)
//   role?: UserRole;
// }
