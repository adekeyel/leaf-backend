import { IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  salary?: string;
}