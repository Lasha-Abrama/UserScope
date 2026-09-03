import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model, mongo, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto.js';
import { FindUsersQueryDto } from './dto/find-users-query.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User, UserDocument } from './schemas/user.schema.js';

const CACHE_TTL_MS = 30_000;

export interface PaginatedUsers {
  data: UserDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TotalUsers {
  totalUsers: number;
}

export interface UserStats {
  totalUsers: number;
  maleUsers: number;
  femaleUsers: number;
  averageAge: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const user = new this.userModel(createUserDto);
      const savedUser = await user.save();
      await this.invalidateReadCache();
      return savedUser;
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(query: FindUsersQueryDto): Promise<PaginatedUsers> {
    const cacheKey = `users:list:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<PaginatedUsers>(cacheKey);

    if (cached) {
      return cached;
    }

    const filter = this.buildFilter(query);
    const skip = (query.page - 1) * query.limit;
    const usersQuery = this.userModel
      .find(filter)
      .skip(skip)
      .limit(query.limit);

    if (query.sortBy) {
      usersQuery.sort({ [query.sortBy]: query.order === 'desc' ? -1 : 1 });
    }

    const [data, total] = await Promise.all([
      usersQuery.exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const result: PaginatedUsers = {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  }

  async findOne(id: string): Promise<UserDocument> {
    this.validateObjectId(id);

    const cacheKey = `users:item:${id}`;
    const cached = await this.cacheManager.get<UserDocument>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set(cacheKey, user, CACHE_TTL_MS);
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    this.validateObjectId(id);

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          returnDocument: 'after',
          runValidators: true,
        })
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.invalidateReadCache();
      return user;
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: string): Promise<void> {
    this.validateObjectId(id);

    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.invalidateReadCache();
  }

  async getTotalUsers(): Promise<TotalUsers> {
    const cacheKey = 'users:total';
    const cached = await this.cacheManager.get<TotalUsers>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = {
      totalUsers: await this.userModel.countDocuments().exec(),
    };

    await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  }

  async getStats(): Promise<UserStats> {
    const [totalUsers, maleUsers, femaleUsers, averageAgeResult] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ gender: 'm' }).exec(),
      this.userModel.countDocuments({ gender: 'f' }).exec(),
      this.userModel.aggregate<{ averageAge: number }>([
        { $group: { _id: null, averageAge: { $avg: '$age' } } },
      ]).exec(),
    ]);

    return {
      totalUsers,
      maleUsers,
      femaleUsers,
      averageAge: Number((averageAgeResult[0]?.averageAge ?? 0).toFixed(1)),
    };
  }

  private buildFilter(query: FindUsersQueryDto): QueryFilter<UserDocument> {
    const filter: QueryFilter<UserDocument> = {};

    if (query.age !== undefined) {
      filter.age = query.age;
    } else {
      if (
        query.ageFrom !== undefined &&
        query.ageTo !== undefined &&
        query.ageFrom > query.ageTo
      ) {
        throw new BadRequestException('ageFrom cannot be greater than ageTo');
      }

      if (query.ageFrom !== undefined || query.ageTo !== undefined) {
        filter.age = {
          ...(query.ageFrom !== undefined && { $gte: query.ageFrom }),
          ...(query.ageTo !== undefined && { $lte: query.ageTo }),
        };
      }
    }

    if (query.gender) {
      filter.gender = query.gender;
    }

    if (query.name) {
      const namePattern = new RegExp(this.escapeRegExp(query.name.trim()), 'i');
      filter.$or = [{ firstName: namePattern }, { lastName: namePattern }];
    }

    return filter;
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async invalidateReadCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      throw new ConflictException('A user with this email already exists');
    }

    throw error;
  }
}
