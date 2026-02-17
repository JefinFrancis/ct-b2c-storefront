import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommercetoolsModule } from "./commercetools/commercetools.module";
import { RedisModule } from "./redis/redis.module";
import { HealthModule } from "./health/health.module";
import { ProductsModule } from "./products/products.module";
import { CartModule } from "./cart/cart.module";
import { AuthModule } from "./auth/auth.module";
import { OrdersModule } from "./orders/orders.module";
import { CustomersModule } from "./customers/customers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    CommercetoolsModule,
    RedisModule,
    HealthModule,
    ProductsModule,
    CartModule,
    AuthModule,
    OrdersModule,
    CustomersModule,
  ],
})
export class AppModule {}
