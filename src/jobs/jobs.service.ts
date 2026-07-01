import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(query: any) {
    const {
      search,
      location,
      company,
      page = '1',
      limit = '10',
    } = query;

    const currentPage = Number(page);
    const currentLimit = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (company) {
      where.company = {
        contains: company,
        mode: 'insensitive',
      };
    }

    const total = await this.prisma.job.count({
      where,
    });

    const jobs = await this.prisma.job.findMany({
      where,
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: jobs,
      total,
      page: currentPage,
      lastPage: Math.ceil(total / currentLimit),
    };
  }

  async findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  async findMyJobs(userId: string) {
    console.log('Current user ID:', userId);

    const jobs = await this.prisma.job.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Jobs found:', jobs);

    return jobs;
  }

  async update(
    jobId: string,
    userId: string,
    dto: UpdateJobDto,
  ) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenException(
        'You can only edit your own jobs',
      );
    }

    return this.prisma.job.update({
      where: {
        id: jobId,
      },
      data: dto,
    });
  }

  async delete(
    jobId: string,
    userId: string,
  ) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own jobs',
      );
    }

    await this.prisma.job.delete({
      where: {
        id: jobId,
      },
    });

    return {
      message: 'Job deleted successfully',
    };
  }
}