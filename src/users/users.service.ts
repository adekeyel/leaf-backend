import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
  import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor( private prisma: PrismaService,
  private cloudinaryService: CloudinaryService,) {}

  // async findById(id: string) {
  //   return this.prisma.user.findUnique({
  //     where: { id },
  //     select: {
  //       id: true,
  //       email: true,
  //       role: true,
  //       createdAt: true,
  //     },
  //   });
  // }
  async findById(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
  fullName: true,
  headline: true,
  email: true,
  phone: true,
  location: true,
  openTo: true,
  bio: true,
  avatarUrl: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
    },
  });
}

  async updateUser(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
  fullName: true,
  headline: true,
  email: true,
  phone: true,
  location: true,
  openTo: true,
  bio: true,
  avatarUrl: true,
  role: true,
  isVerified: true,
  updatedAt: true,
      },
    });
    
  }  
  async changePassword(
  userId: string,
  dto: ChangePasswordDto,
) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  const passwordMatches = await bcrypt.compare(
    dto.currentPassword,
    user.password,
  );

  if (!passwordMatches) {
    throw new UnauthorizedException(
      'Current password is incorrect',
    );
  }

  const hashedPassword = await bcrypt.hash(
    dto.newPassword,
    10,
  );

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully',
  };
}
async uploadAvatar(
  userId: string,
  file: Express.Multer.File,
) {
  const result: any =
    await this.cloudinaryService.uploadFile(file);

  const user = await this.prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: result.secure_url,
    },
  });

  return {
    message: 'Avatar updated successfully',
    avatarUrl: user.avatarUrl,
  };
}
}