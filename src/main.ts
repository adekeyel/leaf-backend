import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: [
      'https://leafs.lovable.app',
      /\.lovable\.app$/,
      'http://localhost:5173',
    ],
    credentials: true,
  });
//   app.enableCors({
//   origin: true,
//   credentials: true,
// });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 const port = process.env.PORT ?? 3001;

await app.listen(port);

console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();
