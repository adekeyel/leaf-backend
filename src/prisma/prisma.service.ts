import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    console.log(
      'DATABASE_URL starts with:',
      process.env.DATABASE_URL?.slice(0, 50),
    );

    try {
      await this.$connect();
      console.log('Prisma connected successfully');
    } catch (err) {
      console.error('Prisma connection failed:', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}