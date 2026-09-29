import { Injectable, NotFoundException } from '@nestjs/common';

// <-- Converted from 'type' to 'enum' so NestJS can validate it at runtime
export enum UserRole {
  INTERN = 'intern',
  ENGINEER = 'engineer',
  ADMIN = 'admin',
}

export class CreateUserDto { //DTOs must be defined as class
  /*DTO:object that defines the exact shape and schema of data sent over the network in an HTTP request/response.*/
  name: string;
  email: string;
  role: UserRole;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      name: 'Ethan Morrison',
      email: 'ethan.morrison@example.com',
      role: UserRole.ENGINEER, // <-- Updated to use the Enum
    },
    {
      id: 2,
      name: 'Sophia Bennett',
      email: 'sophia.bennett@example.com',
      role: UserRole.ADMIN, // <-- Updated to use the Enum
    },
    {
      id: 3,
      name: 'Lucas Anderson',
      email: 'lucas.anderson@example.com',
      role: UserRole.INTERN, // <-- Updated to use the Enum
    },
    {
      id: 4,
      name: 'Maya Thompson',
      email: 'maya.thompson@example.com',
      role: UserRole.ENGINEER, // <-- Updated to use the Enum
    },
    {
      id: 5,
      name: 'Oliver Martinez',
      email: 'oliver.martinez@example.com',
      role: UserRole.INTERN, // <-- Updated to use the Enum
    },
  ];

  findAll(role?: UserRole) {
    if (role) {
      return this.users.filter((user) => user.role === role);
    }
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id); // .find() returns undefined if it doesn't find a matching value.
    if (!user) {
      //!undefined evals to true
      throw new NotFoundException(
        "Error! Entered ID matching record doesn't exist",
      );
    }
    return user;
  }

  create(user: CreateUserDto) {
    const userByOrder = [...this.users].sort((a, b) => b.id - a.id); //org array isnt sorted here,desc-sorted version is assigned to this var

    const highestId = userByOrder.length > 0 ? userByOrder[0].id : 0; //ternary to check if array.length === 1

    const newUser = {
      id: highestId + 1, //temp array has objects wrt id desc order
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateUser: UpdateUserDto) {
    // 1. Find the exact index of the user in your array
    const userIndex = this.users.findIndex((user) => user.id === id); // .findIndex() returns -1 if not found

    // 2. If the user doesn't exist, you could throw an error here later
    if (userIndex === -1) {
      throw new NotFoundException(
        "Error! Entered ID matching record doesn't exist",
      );
    }

    // 3. Merge the old data with the new data using the spread operator
    const updatedUser = {
      ...this.users[userIndex], // The old data
      ...updateUser, // Overwrites matching fields with new data
    };

    // 4. Save the merged object back into the main array
    this.users[userIndex] = updatedUser;

    // 5. Return the updated record
    return updatedUser; //For extra verification in prod code, u can return this.findOne(id) here,so u know from DB, change reflected
  }

  delete(id: number) {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(
        "Error! Entered ID matching record doesn't exist",
      );
    }

    const removedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    return removedUser;
  }
}
