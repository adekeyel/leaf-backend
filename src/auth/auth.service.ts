import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // REGISTER (already working)
  async register(registerDto: RegisterDto) {
    const { fullName, email, password, role } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  // LOGIN (NEW)
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
console.log('User found:', user?.email);

console.log('Password match:', passwordMatch);

    const tokens = await this.generateTokens(user);

await this.updateRefreshToken(
  user.id,
   tokens.refreshToken,
 );

return {
  message: 'Login successful',
  ...tokens,
  user: {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  },
};
    
  }
 private async generateTokens(user: any) {
  console.log('JWT_SECRET =', process.env.JWT_SECRET);

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload, {
    expiresIn: '15m',
  });

  const refreshToken = await this.jwtService.signAsync(payload, {
    expiresIn: '7d',
  });

  return {
    accessToken,
    refreshToken,
  };

}
private async updateRefreshToken(
  userId: string,
  refreshToken: string,
) {
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: hashedRefreshToken,
    },
  });
}

async refreshToken(refreshToken: string) {
  try {
    console.log('Refresh token received');

   const payload = await this.jwtService.verifyAsync(refreshToken, {
  secret: this.jwtService['options']?.secret,
});
    console.log('Payload:', payload);

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    console.log('User found:', user?.email);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    console.log('Token matches:', refreshTokenMatches);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return tokens;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async logout(userId: string) {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
    },
  });

  return {
    message: 'Logged out successfully',
  };
}
}