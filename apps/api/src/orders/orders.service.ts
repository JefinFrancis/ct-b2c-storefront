import { Injectable } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";

@Injectable()
export class OrdersService {
  constructor(private readonly ct: CommercetoolsService) {}

  async findByCustomer(customerId: string) {
    const api = this.ct.getApiRoot();

    const response = await api
      .orders()
      .get({
        queryArgs: {
          where: `customerId="${customerId}"`,
          sort: "createdAt desc",
          limit: 50,
        },
      })
      .execute();

    return response.body.results;
  }
}
