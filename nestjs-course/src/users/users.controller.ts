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
  ParseEnumPipe // <-- Added to validate the role query parameter at runtime
} from '@nestjs/common';

import {
  UsersService,
  UserRole,
  CreateUserDto, // <-- Imported DTO to replace {}
  UpdateUserDto  // <-- Imported DTO to replace {}
} from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService:UsersService){}
  /*
   GET / users
   GET / users/ :id
   POST / users
   PATCH / users / :id
   DELETE / users / :id
   */

  /*handler 1-Normal @Get() that fetches all records, except we've added QP(optional) as well,if  no QP entered,just fecthes all records*/
  @Get() 
  findAll(@Query('role', new ParseEnumPipe(UserRole, { optional: true })) role?: UserRole) { // <-- Added ParseEnumPipe for runtime validation
    /*QP added:but made optional; ie, normal @Get() works*/
    return this.usersService.findAll(role);
  }
  // Order of route handlers matters as well (method is Route Handler)
  //    @Get('interns')  // 1. Static route goes first,if order were reverse, users/interns would pick Get/:id, wherein id = intern
  //    findAllInterns(){
  //     return []
  //    }

  @Get(':id') // 2. Dynamic route goes after, dynamic, id val is open to interpretation, so be cautious
  findOne(@Param('id', ParseIntPipe) id: number) { // <-- Converted to number via ParseIntPipe
    return this.usersService.findOne(id); // <-- Delegated work to the Service
  }

  @Post()
  create(@Body() user: CreateUserDto) { // <-- Replaced {} with the proper DTO
    return this.usersService.create(user); // <-- Delegated work to the Service
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // <-- Converted to number via ParseIntPipe
    @Body() userUpdate: UpdateUserDto      // <-- Replaced {} with the proper DTO
  ) {
    return this.usersService.update(id, userUpdate); // <-- Delegated work to the Service
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) { // <-- Converted to number via ParseIntPipe
    return this.usersService.delete(id); // <-- Delegated work to the Service
  }
}