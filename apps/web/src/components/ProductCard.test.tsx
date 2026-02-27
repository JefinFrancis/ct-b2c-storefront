import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductCard from "./ProductCard";
import type { Product } from "@ct-b2c/types";

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-123",
  version: 1,
  name: { "en-US": "Test Product" },
  slug: { "en-US": "test-product" },
  masterVariant: {
    id: 1,
    sku: "SKU-123",
    prices: [
      {
        id: "price-1",
        value: {
            centAmount: 9999,
            currencyCode: "USD",
            fractionDigits: 2,
          },
      },
    ],
    images: [
      {
        url: "https://example.com/image.jpg",
        dimensions: { w: 400, h: 400 },
      },
    ],
    attributes: [],
  },
  variants: [],
  categories: [],
  ...overrides,
});

describe("ProductCard", () => {
  it("renders product name", () => {
    const product = createMockProduct();

    render(<ProductCard product={product} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders formatted price", () => {
    const product = createMockProduct();

    render(<ProductCard product={product} />);

    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("links to product detail page using slug", () => {
    const product = createMockProduct();

    render(<ProductCard product={product} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/test-product");
  });

  it("uses locale-specific name when available", () => {
    const product = createMockProduct({
      name: { "en-US": "US Product", "de-DE": "German Product" },
    });

    render(<ProductCard product={product} locale="de-DE" />);

    expect(screen.getByText("German Product")).toBeInTheDocument();
  });

  it("falls back to en-US name when locale not found", () => {
    const product = createMockProduct({
      name: { "en-US": "Fallback Name" },
    });

    render(<ProductCard product={product} locale="fr-FR" />);

    expect(screen.getByText("Fallback Name")).toBeInTheDocument();
  });

  it("renders product image", () => {
    const product = createMockProduct();

    render(<ProductCard product={product} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "Test Product");
  });

  it('displays "Price unavailable" when no prices', () => {
    const product = createMockProduct({
      masterVariant: {
        id: 1,
        sku: "SKU-123",
        prices: [],
        images: [],
        attributes: [],
      },
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText("Price unavailable")).toBeInTheDocument();
  });

  it("prefers USD price over other currencies", () => {
    const product = createMockProduct({
      masterVariant: {
        id: 1,
        sku: "SKU-123",
        prices: [
          {
            id: "price-eur",
            value: {
              centAmount: 8500,
              currencyCode: "EUR",
              fractionDigits: 2,
            },
          },
          {
            id: "price-usd",
            value: {
              centAmount: 9999,
              currencyCode: "USD",
              fractionDigits: 2,
            },
          },
        ],
        images: [],
        attributes: [],
      },
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("renders placeholder when no images", () => {
    const product = createMockProduct({
      masterVariant: {
        id: 1,
        sku: "SKU-123",
        prices: [
          {
            id: "price-1",
            value: {
              centAmount: 9999,
              currencyCode: "USD",
              fractionDigits: 2,
            },
          },
        ],
        images: [],
        attributes: [],
      },
    });

    render(<ProductCard product={product} />);

    // Should not have an img tag, but a placeholder SVG
    const images = screen.queryAllByRole("img");
    expect(images).toHaveLength(0);
  });
});
