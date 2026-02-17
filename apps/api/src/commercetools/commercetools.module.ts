import { Module, Global } from "@nestjs/common";
import { CommercetoolsService } from "./commercetools.service";

@Global()
@Module({
  providers: [CommercetoolsService],
  exports: [CommercetoolsService],
})
export class CommercetoolsModule {}
