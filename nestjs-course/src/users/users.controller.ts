import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe, // <-- Added to convert string IDs from the URL into real numbers
  ParseEnumPipe, // <-- Added to validate the role query parameter at runtime
  DefaultValuePipe, // <-- Added so page/limit fall back to defaults when not sent
  ValidationPipe, // read comment beneath
  UseGuards, // <-- Added to protect routes with the auth/roles guards
} from '@nestjs/common';

// NOTE: ValidationPipe(enforces check on BODY (checks if accordance w/ DTO and class-validators)
// passed in Post/Patch)is handled globally via app.useGlobalPipes() in main.ts.

// If not done globally, then only do it here, just for prac done here
// If not enabled globally,import &pass it locally here: @Body(ValidationPipe)

import { UsersService } from './users.service';

import {
  CreateUserDto, // <-- Imported DTO to replace {}
} from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';

import { UserRole } from './enums/user-role.enum';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /*
   GET / users
   GET / users/ :id
   POST / users
   PATCH / users / :id
   DELETE / users / :id
   */

  /*handler 1-Normal @Get() that fetches all records, except we've added QP(optional) as well,if  no QP entered,just fecthes all records*/
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('role', new ParseEnumPipe(UserRole, { optional: true }))
    role?: UserRole,
    @Query('search') search?: string, // matches name (contains) or exact ID
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
  ) {
    // <-- Added ParseEnumPipe for runtime validation
    /*QP added:but made optional; ie, normal @Get() works*/
    return this.usersService.findAll(role, search, page, limit);
  }

  // Order of route handlers matters as well (method is Route Handler)
  //    @Get('interns')  // 1. Static route goes first,if order were reverse, users/interns would pick Get/:id, wherein id = intern
  //    findAllInterns(){
  //     return []
  //    }

  @UseGuards(JwtAuthGuard)
  @Get(':id') // 2. Dynamic route goes after, dynamic, id val is open to interpretation, so be cautious
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- Converted to number via ParseIntPipe
    return this.usersService.findOne(id); // <-- Delegated work to the Service
  }

  @Post()
  create(@Body(ValidationPipe) user: CreateUserDto) { //Read ValidationPipe comment at top
    // <-- Replaced {} with the proper DTO
    return this.usersService.create(user); // <-- Delegated work to the Service
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number, // <-- Converted to number via ParseIntPipe
    @Body(ValidationPipe) userUpdate: UpdateUserDto, // <-- Replaced {} with the proper DTO
  ) {
    return this.usersService.update(id, userUpdate); // <-- Delegated work to the Service
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    // <-- Converted to number via ParseIntPipe
    return this.usersService.delete(id); // <-- Delegated work to the Service
  }
}