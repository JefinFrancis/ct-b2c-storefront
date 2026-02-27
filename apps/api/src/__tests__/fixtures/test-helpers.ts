import { Test, TestingModule } from '@nestjs/testing';
import { CommercetoolsService } from '../../commercetools/commercetools.service';
import { RedisService } from '../../redis/redis.service';

/**
 * Mock Factories for Service Tests
 * Generate mock instances for dependency injection
 */

export const createMockCommercetoolsService = () => ({
  getProducts: jest.fn(),
  getProductBySlug: jest.fn(),
  getCategories: jest.fn(),
  getCart: jest.fn(),
  createCart: jest.fn(),
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCart: jest.fn(),
  createOrder: jest.fn(),
  getOrderById: jest.fn(),
  findOrdersByCustomer: jest.fn(),
  createPayment: jest.fn(),
  getPayment: jest.fn(),
  updatePayment: jest.fn(),
  addTransaction: jest.fn(),
  createCustomer: jest.fn(),
  getCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  addAddress: jest.fn(),
  updateAddress: jest.fn(),
  removeAddress: jest.fn(),
  setDefaultShippingAddress: jest.fn(),
  setDefaultBillingAddress: jest.fn(),
  createShoppingList: jest.fn(),
  getOrCreateShoppingList: jest.fn(),
  addToShoppingList: jest.fn(),
  removeFromShoppingList: jest.fn(),
  getShoppingList: jest.fn(),
  updateShoppingList: jest.fn(),
  addDiscountCode: jest.fn(),
  removeDiscountCode: jest.fn(),
  getDiscountCode: jest.fn(),
  setCustomerId: jest.fn(),
  setShippingAddress: jest.fn(),
  setShippingMethod: jest.fn(),
  getShippingMethods: jest.fn(),
  setBillingAddress: jest.fn(),
});

export const createMockRedisService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  getex: jest.fn(),
  incrby: jest.fn(),
  append: jest.fn(),
});

export const createMockAuthService = () => ({
  login: jest.fn(),
  register: jest.fn(),
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  generateJwt: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
});

/**
 * Test Module Builder
 * Helper to create NestJS test modules with common mocks
 */
export async function createTestingModule(
  providers: any[],
  imports: any[] = []
): Promise<TestingModule> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: CommercetoolsService,
        useValue: createMockCommercetoolsService(),
      },
      {
        provide: RedisService,
        useValue: createMockRedisService(),
      },
    ],
    imports,
  }).compile();

  return moduleFixture;
}
