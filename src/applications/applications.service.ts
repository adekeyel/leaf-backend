import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ApplyJobDto } from './dto/apply-job.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async applyToJob(
    userId: string,
    jobId: string,
    dto: ApplyJobDto,
  ) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException(
        'Job not found',
      );
    }

    const existingApplication =
      await this.prisma.application.findFirst({
        where: {
          userId,
          jobId,
        },
      });

    if (existingApplication) {
      throw new BadRequestException(
        'You have already applied to this job',
      );
    }

    return this.prisma.application.create({
      data: {
        userId,
        jobId,
        coverLetter: dto.coverLetter,
      },
    });
  }

  async findMyApplications(
    userId: string,
  ) {
    return this.prisma.application.findMany({
      where: {
        userId,
      },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findApplicants(
    employerId: string,
    jobId: string,
  ) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException(
        'Job not found',
      );
    }

    if (job.userId !== employerId) {
      throw new BadRequestException(
        'You can only view applicants for your own jobs',
      );
    }

    return this.prisma.application.findMany({
      where: {
        jobId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}