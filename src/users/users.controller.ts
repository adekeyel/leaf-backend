import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Patch,
  Body,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/jwt/roles.guard';
import { UserRole } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(
      req.user.userId,
      updateUserDto,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin')
adminOnly() {
  return {
    message: 'Welcome Admin!',
  };
}
@UseGuards(JwtAuthGuard)
@Post('change-password')
changePassword(
  @Req() req,
  @Body() dto: ChangePasswordDto,
) {
  return this.usersService.changePassword(
    req.user.userId,
    dto,
  );
}
@UseGuards(JwtAuthGuard)
@Post('avatar')
@UseInterceptors(FileInterceptor('avatar'))
uploadAvatar(
  @Req() req,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.usersService.uploadAvatar(
    req.user.userId,
    file,
  );
}
}