import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })//alr ensures not empty, but good prac to handle all
  name: string;
  

  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;


  @IsString()
  @MaxLength(64, { message: 'Password must be at most 64 characters long' })
  @IsStrongPassword(
    { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
      message:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a symbol',
    },
  )
  password: string;


  @IsEnum(UserRole, { message: 'Role must be one of: intern, engineer, admin' })
  role: UserRole;
}

// 1)Constraint Value + ValidationOptions format example of class-validator above: -2 paras: at least 1 is an object`
// @MinLength(3, { message: 'Name must be at least 3 characters long' })
// @IsEnum()

// 2)Specific Options + ValidationOptions
// Decorators like @IsEmail() or @IsNumber() have domain-specific options for their primary check.
// @IsNumber(options, validationOptions)

// 1st arg: number formatting rules; 2nd arg: class-validator options
// @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must have at most 2 decimal places' })
// price: number;