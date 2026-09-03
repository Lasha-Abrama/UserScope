import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { faker } from '@faker-js/faker';
import { Model } from 'mongoose';
import { AppModule } from './app.module.js';
import { User } from './users/schemas/user.schema.js';

const TOTAL_USERS = 150_000;
const BATCH_SIZE = 5_000;

interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: 'm' | 'f';
  phoneNumber: string;
  city: string;
  country: string;
}

function createSeedUser(index: number): SeedUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const emailName = `${firstName}.${lastName}`
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9.]/g, '')
    .toLowerCase();

  return {
    firstName,
    lastName,
    email: `${emailName || 'user'}.${index}@example.com`,
    age: faker.number.int({ min: 18, max: 100 }),
    gender: faker.helpers.arrayElement(['m', 'f'] as const),
    phoneNumber: faker.phone.number(),
    city: faker.location.city(),
    country: faker.location.country(),
  };
}

async function seed(): Promise<void> {
  const logger = new Logger('UserSeeder');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    logger.log('Clearing the users collection...');
    await userModel.deleteMany({}).exec();
    faker.seed(2026);

    for (let start = 0; start < TOTAL_USERS; start += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_USERS - start);
      const users = Array.from({ length: batchSize }, (_, offset) =>
        createSeedUser(start + offset),
      );

      await userModel.insertMany(users);
      logger.log(`Inserted ${start + batchSize}/${TOTAL_USERS} users`);
    }

    const totalUsers = await userModel.countDocuments().exec();
    logger.log(`Seeding complete. Total users: ${totalUsers}`);
  } finally {
    await app.close();
  }
}

await seed();
