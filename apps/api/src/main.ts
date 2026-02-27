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

  // CORS configuration — supports comma-separated origins for multi-environment deployments
  const rawAllowedOrigins =
    process.env.ALLOWED_ORIGIN ?? "http://localhost:3000,http://localhost:3001";
  const allowedOrigins = rawAllowedOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server calls, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
