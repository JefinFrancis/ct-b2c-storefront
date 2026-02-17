import { Injectable, NotFoundException } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { CustomerUpdateAction } from "@commercetools/platform-sdk";

interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class CustomersService {
  constructor(private readonly ct: CommercetoolsService) {}

  async findById(id: string) {
    const api = this.ct.getApiRoot();

    try {
      const response = await api
        .customers()
        .withId({ ID: id })
        .get()
        .execute();
      return response.body;
    } catch {
      throw new NotFoundException(`Customer with id "${id}" not found`);
    }
  }

  async update(id: string, input: UpdateCustomerInput) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(id);

    const actions: CustomerUpdateAction[] = [];

    if (input.firstName) {
      actions.push({ action: "setFirstName", firstName: input.firstName });
    }
    if (input.lastName) {
      actions.push({ action: "setLastName", lastName: input.lastName });
    }

    if (actions.length === 0) {
      return customer;
    }

    const response = await api
      .customers()
      .withId({ ID: id })
      .post({
        body: {
          version: customer.version,
          actions,
        },
      })
      .execute();

    return response.body;
  }
}
