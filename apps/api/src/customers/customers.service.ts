import { Injectable, NotFoundException } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { CustomerUpdateAction } from "@commercetools/platform-sdk";

interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  companyName?: string;
}

interface AddressInput {
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
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
    if (input.dateOfBirth !== undefined) {
      actions.push({
        action: "setDateOfBirth",
        dateOfBirth: input.dateOfBirth || undefined,
      });
    }
    if (input.companyName !== undefined) {
      actions.push({
        action: "setCompanyName",
        companyName: input.companyName || undefined,
      });
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

  // ─────────────────────────────────────────────────────────────
  // Address management
  // ─────────────────────────────────────────────────────────────

  /**
   * Add a new address to the customer.
   */
  async addAddress(customerId: string, address: AddressInput) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: "addAddress", address }],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Update an existing address on the customer.
   */
  async updateAddress(
    customerId: string,
    addressId: string,
    address: AddressInput,
  ) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [
            {
              action: "changeAddress",
              addressId,
              address,
            },
          ],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Remove an address from the customer.
   */
  async removeAddress(customerId: string, addressId: string) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: "removeAddress", addressId }],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Set the default shipping address for the customer.
   */
  async setDefaultShippingAddress(customerId: string, addressId: string) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: "setDefaultShippingAddress", addressId }],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Set the default billing address for the customer.
   */
  async setDefaultBillingAddress(customerId: string, addressId: string) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: "setDefaultBillingAddress", addressId }],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Add an address to the shipping address IDs for the customer.
   */
  async addShippingAddressId(customerId: string, addressId: string) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: "addShippingAddressId", addressId }],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Add an address to the billing address IDs for the customer.
   */
  async addBillingAddressId(customerId: string, addressId: string) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .withId({ ID: customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: "addBillingAddressId", addressId }],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Change customer password.
   */
  async changePassword(
    customerId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const api = this.ct.getApiRoot();
    const customer = await this.findById(customerId);

    const response = await api
      .customers()
      .password()
      .post({
        body: {
          id: customerId,
          version: customer.version,
          currentPassword,
          newPassword,
        },
      })
      .execute();

    return response.body;
  }
}
