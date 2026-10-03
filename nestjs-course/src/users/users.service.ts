import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';
import { hashPassword } from '../auth/password.util';

// Default login password for the seeded users below (meets the strong-password rule)
const SEED_PASSWORD = 'Welcome@123';

// What is stored internally; `password` is always a scrypt hash, never plain text
interface StoredUser {// interface for object, below when StoredUser[] means array of those objects, each object of type StoredUser
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}
@Injectable()
export class UsersService {
  private users: StoredUser[] = [ // array of objects, each object is of type StoredUser
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
    {
      id: 6,
      name: 'Harper Brooks',
      email: 'harper.brooks@example.com',
      role: UserRole.ENGINEER, // <-- Updated to use the Enum
    },
    {
      id: 7,
      name: 'Mason Patel',
      email: 'mason.patel@example.com',
      role: UserRole.ADMIN, // <-- Updated to use the Enum
    },
    {
      id: 8,
      name: 'Chloe Sullivan',
      email: 'chloe.sullivan@example.com',
      role: UserRole.INTERN, // <-- Updated to use the Enum
    },
    {
      id: 9,
      name: 'Logan Reed',
      email: 'logan.reed@example.com',
      role: UserRole.ENGINEER, // <-- Updated to use the Enum
    },
    {
      id: 10,
      name: 'Zoe Henderson',
      email: 'zoe.henderson@example.com',
      role: UserRole.ADMIN, // <-- Updated to use the Enum
    },
    {
      id: 11,
      name: 'Caleb Foster',
      email: 'caleb.foster@example.com',
      role: UserRole.INTERN, // <-- Updated to use the Enum
    },
    {
      id: 12,
      name: 'Aria Ramirez',
      email: 'aria.ramirez@example.com',
      role: UserRole.ENGINEER, // <-- Updated to use the Enum
    },
    {
      id: 13,
      name: 'Gabriel Jenkins',
      email: 'gabriel.jenkins@example.com',
      role: UserRole.INTERN, // <-- Updated to use the Enum
    },
    {
      id: 14,
      name: 'Lily Washington',
      email: 'lily.washington@example.com',
      role: UserRole.ADMIN, // <-- Updated to use the Enum
    },
    {
      id: 15,
      name: 'Julian Hayes',
      email: 'julian.hayes@example.com',
      role: UserRole.ENGINEER, // <-- Updated to use the Enum
    },
  ];

  constructor() {
    // give every seeded user the same hashed default password
    const seedHash = hashPassword(SEED_PASSWORD);
    this.users.forEach((user) => {
      user.password = seedHash;
    });
  }

  // strips the password hash before anything leaves the service
  private toPublic({ password: _password, ...rest }: StoredUser) {
    return rest;
  }

  // login is by email, so emails must be unique
  private assertEmailFree(email: string, ignoreId?: number) {
    const taken = this.users.some(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.id !== ignoreId,
    );
    if (taken) throw new ConflictException('Email is already registered');
  }

  // internal use only (login): returns the stored record INCLUDING the hash
  findByEmail(email: string) {
    return this.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
  }

  findAll(role?: UserRole, search?: string, page = 1, limit = 5) {
    let result = this.users;

    if (role) {
      result = result.filter((user) => user.role === role);
    }

    // search: name contains (case-insensitive) OR exact ID
    const q = search?.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (user) => user.name.toLowerCase().includes(q) || String(user.id) === q,
      );
    }

    const total = result.length;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    // clamp so an out-of-range page (e.g. after deleting the last item on the last page) still works
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * safeLimit;

     return {
      data: result
        .slice(start, start + safeLimit)
        .map((user) => this.toPublic(user)),
      total,
      page: currentPage, // the clamped page, which the Vue code expects in `page`
      limit: safeLimit,
      totalPages,
    };
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id); // .find() returns undefined if it doesn't find a matching value.
    if (!user) {
      // returns the matching nested object from array
      //!undefined evals to true      //here. .find() is enough, as it returns the matching object, thats enough for API response.
      throw new NotFoundException(
        "Error! Entered ID matching record doesn't exist",
      );
    }
    return this.toPublic(user);
  }

  //here .find() may give the matching nested object, but we'd not be able to update this.users, as we dk nested object's index
  //in this.users;  so even if we've ready object to be updated, we dk where to push in this.users !!!

  //so used .findIndex() here

  create(user: CreateUserDto) {
    // registration can never create an admin; only an admin can promote someone via update
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot be self-registered');
    }
    this.assertEmailFree(user.email);

    const userByOrder = [...this.users].sort((a, b) => b.id - a.id); //org array isnt sorted here,desc-sorted version is assigned to this var

    const highestId = userByOrder.length > 0 ? userByOrder[0].id : 0; //ternary to check if array has no elements edge case

    const newUser = {
      id: highestId + 1, //temp array has objects wrt id desc order
      ...user,
      password: hashPassword(user.password), // never store the plain password
    };
    this.users.push(newUser); //new object pushed to og array, og array maintains its ascending order of ids
    return this.toPublic(newUser);
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

    // an email change must not collide with another account (login is by email)
    if (updateUser.email) {
      this.assertEmailFree(updateUser.email, id);
    }

    // 3. Merge the old data with the new data using the spread operator
    const { password, ...rest } = updateUser; // password handled separately so it gets hashed
    const updatedUser = {
      ...this.users[userIndex], // The old data
      ...rest, // Overwrites matching fields with new data (whe duplicate keys, last key is taken, former ones are deleted)
      ...(password ? { password: hashPassword(password) } : {}), // only replaced if a new password was sent
    };

    // 4. Save the merged object back into the main array
    this.users[userIndex] = updatedUser;

    // 5. Return the updated record (without the password hash)
    return this.toPublic(updatedUser); //For extra verification in prod code, u can return this.findOne(id) here,so u know from DB, change reflected
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
    return this.toPublic(removedUser);
  }
}
