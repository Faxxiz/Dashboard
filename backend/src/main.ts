import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  });
  
  // Use global exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(3000);
  console.log('🚀 Backend server running on http://localhost:3000');
}

bootstrap();
