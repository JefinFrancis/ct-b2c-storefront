import { faker } from '@faker-js/faker';

/**
 * Data Factories for API Tests
 * Generate consistent test data with overridable defaults
 */

export const createUserData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: 'TestPassword123!',
  ...overrides,
});

export const createProductData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
  description: faker.commerce.productDescription(),
  price: {
    centAmount: parseInt(faker.commerce.price({ min: 10, max: 500 })) * 100,
    currencyCode: 'USD',
  },
  stock: faker.number.int({ min: 0, max: 100 }),
  categories: [faker.commerce.department()],
  images: [faker.image.url()],
  ...overrides,
});

export const createCartData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  customerId: null,
  lineItems: [],
  totalPrice: { centAmount: 0, currencyCode: 'USD' },
  discountCodes: [],
  ...overrides,
});

export const createAddressData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  streetName: faker.location.streetAddress(),
  city: faker.location.city(),
  region: faker.location.state({ abbreviated: true }),
  postalCode: faker.location.zipCode(),
  country: 'US',
  ...overrides,
});

export const createPaymentData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  cartId: faker.string.uuid(),
  amount: { centAmount: 10000, currencyCode: 'USD' },
  method: 'credit-card',
  state: 'Pending',
  transactions: [],
  ...overrides,
});

export const createOrderData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  orderNumber: `ORD-${faker.string.numeric(6)}`,
  cartId: faker.string.uuid(),
  customerId: faker.string.uuid(),
  lineItems: [],
  totalPrice: { centAmount: 0, currencyCode: 'USD' },
  shippingAddress: createAddressData(),
  billingAddress: createAddressData(),
  paymentState: 'Pending',
  shipmentState: 'Pending',
  ...overrides,
});

export const createWishlistData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  name: 'My Wishlist',
  customerId: faker.string.uuid(),
  lineItems: [],
  ...overrides,
});

export const createDiscountCodeData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  code: faker.string.alphaNumeric(8).toUpperCase(),
  type: 'percentage',
  value: faker.number.int({ min: 5, max: 50 }),
  minimumCartValue: null,
  usageLimit: null,
  usageCount: 0,
  isActive: true,
  validFrom: new Date(),
  validUntil: faker.date.future(),
  ...overrides,
});

export const createShippingMethodData = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  price: { centAmount: faker.number.int({ min: 500, max: 5000 }), currencyCode: 'USD' },
  deliveryDays: faker.number.int({ min: 1, max: 10 }),
  ...overrides,
});
