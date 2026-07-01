import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/jwt/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateJobDto } from './dto/update-job.dto';
import { Query } from '@nestjs/common';
import { QueryJobDto } from './dto/query-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  @Post()
  create(
    @Req() req,
    @Body() dto: CreateJobDto,
    
  ) {
    return this.jobsService.create(
      req.user.userId,
      dto,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
@Patch(':id')
update(
  @Param('id') id: string,
  @Req() req: any,
  @Body() dto: UpdateJobDto,
) {
  return this.jobsService.update(
    id,
    req.user.userId,
    dto,
  );
}
@Get()
findAll(
  @Query() query: QueryJobDto,
) {
  return this.jobsService.findAll(query);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
@Get('my-jobs')
findMyJobs(@Req() req: any) {
  console.log('MY JOBS ENDPOINT HIT');
  console.log(req.user);

  return this.jobsService.findMyJobs(
    req.user.userId,
  );
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
@Delete(':id')
remove(
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.jobsService.delete(
    id,
    req.user.userId,
  );
}
@Get(':id')
findOne(@Param('id') id: string) {
  return this.jobsService.findOne(id);
}}