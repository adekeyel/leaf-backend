import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';

import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/jwt/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApplyJobDto } from './dto/apply-job.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @Post('jobs/:jobId/apply')
  apply(
    @Req() req: any,
    @Param('jobId') jobId: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.applicationsService.applyToJob(
      req.user.userId,
      jobId,
      dto,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.JOB_SEEKER)
@Get('me')
findMyApplications(
  @Req() req: any,
) {
  return this.applicationsService.findMyApplications(
    req.user.userId,
  );
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
@Get('job/:jobId')
findApplicants(
  @Req() req: any,
  @Param('jobId') jobId: string,
) {
  return this.applicationsService.findApplicants(
    req.user.userId,
    jobId,
  );
}
}