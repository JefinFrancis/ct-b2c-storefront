import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Global API prefix (excluding health endpoint for Cloud Run)
  app.setGlobalPrefix("api/v1", {
    exclude: ["health"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
