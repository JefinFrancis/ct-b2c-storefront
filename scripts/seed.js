/**
 * CT B2C Storefront — Sample Data Seed Script
 *
 * Seeds the commercetools project with:
 *   1. Tax categories
 *   2. Product types (with attributes: color, size, material, brand)
 *   3. Categories (3-level hierarchy: root → sub → sub-sub)
 *   4. Products (10 products across categories, with variants, prices, images)
 *   5. Shipping zones + shipping methods
 *
 * Usage:
 *   cd scripts && node seed.js
 *
 * Requires: scripts/.env with CT credentials
 */

require("dotenv").config();
const {
  ClientBuilder,
} = require("@commercetools/sdk-client-v2");
const {
  createApiBuilderFromCtpClient,
} = require("@commercetools/platform-sdk");
const fetch = require("node-fetch");

// ── CT Client Setup ──────────────────────────────────────────────────────────

const projectKey = process.env.CTP_PROJECT_KEY;
const authUrl = process.env.CTP_AUTH_URL;
const apiUrl = process.env.CTP_API_URL;
const clientId = process.env.CTP_CLIENT_ID;
const clientSecret = process.env.CTP_CLIENT_SECRET;
const scopes = process.env.CTP_SCOPES.split(" ");

const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow({
    host: authUrl,
    projectKey,
    credentials: { clientId, clientSecret },
    scopes,
    fetch,
  })
  .withHttpMiddleware({ host: apiUrl, fetch })
  .build();

const api = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
  projectKey,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 1. Tax Categories ────────────────────────────────────────────────────────

async function seedTaxCategories() {
  log("💰", "Creating tax categories...");

  const existing = await api.taxCategories().get().execute();
  if (existing.body.results.length > 0) {
    log("⏭️", `Tax categories already exist (${existing.body.results.length}), skipping.`);
    return existing.body.results[0];
  }

  const taxCategory = await api
    .taxCategories()
    .post({
      body: {
        name: "Standard Tax",
        key: "standard-tax",
        rates: [
          {
            name: "US Standard",
            country: "US",
            amount: 0.08,
            includedInPrice: false,
          },
        ],
      },
    })
    .execute();

  log("✅", `Tax category created: ${taxCategory.body.name}`);
  return taxCategory.body;
}

// ── 2. Product Types ─────────────────────────────────────────────────────────

async function seedProductTypes() {
  log("📦", "Creating product types...");

  const existing = await api.productTypes().get().execute();
  if (existing.body.results.length > 0) {
    log("⏭️", `Product types already exist (${existing.body.results.length}), skipping.`);
    return existing.body.results[0];
  }

  const productType = await api
    .productTypes()
    .post({
      body: {
        name: "Standard Product",
        key: "standard-product",
        description: "Standard product type for B2C storefront",
        attributes: [
          {
            name: "color",
            label: { en: "Color" },
            type: { name: "ltext" },
            isRequired: false,
            isSearchable: true,
            attributeConstraint: "None",
            inputHint: "SingleLine",
          },
          {
            name: "size",
            label: { en: "Size" },
            type: { name: "text" },
            isRequired: false,
            isSearchable: true,
            attributeConstraint: "None",
            inputHint: "SingleLine",
          },
          {
            name: "material",
            label: { en: "Material" },
            type: { name: "text" },
            isRequired: false,
            isSearchable: true,
            attributeConstraint: "None",
            inputHint: "SingleLine",
          },
          {
            name: "brand",
            label: { en: "Brand" },
            type: { name: "text" },
            isRequired: false,
            isSearchable: true,
            attributeConstraint: "None",
            inputHint: "SingleLine",
          },
        ],
      },
    })
    .execute();

  log("✅", `Product type created: ${productType.body.name}`);
  return productType.body;
}

// ── 3. Categories ────────────────────────────────────────────────────────────

const CATEGORY_TREE = [
  {
    key: "clothing",
    name: { en: "Clothing" },
    slug: { en: "clothing" },
    orderHint: "0.1",
    children: [
      {
        key: "mens-clothing",
        name: { en: "Men's Clothing" },
        slug: { en: "mens-clothing" },
        orderHint: "0.11",
        children: [
          { key: "mens-shirts", name: { en: "Shirts" }, slug: { en: "mens-shirts" }, orderHint: "0.111" },
          { key: "mens-pants", name: { en: "Pants" }, slug: { en: "mens-pants" }, orderHint: "0.112" },
        ],
      },
      {
        key: "womens-clothing",
        name: { en: "Women's Clothing" },
        slug: { en: "womens-clothing" },
        orderHint: "0.12",
        children: [
          { key: "womens-tops", name: { en: "Tops" }, slug: { en: "womens-tops" }, orderHint: "0.121" },
          { key: "womens-dresses", name: { en: "Dresses" }, slug: { en: "womens-dresses" }, orderHint: "0.122" },
        ],
      },
    ],
  },
  {
    key: "accessories",
    name: { en: "Accessories" },
    slug: { en: "accessories" },
    orderHint: "0.2",
    children: [
      { key: "bags", name: { en: "Bags" }, slug: { en: "bags" }, orderHint: "0.21" },
      { key: "watches", name: { en: "Watches" }, slug: { en: "watches" }, orderHint: "0.22" },
    ],
  },
  {
    key: "footwear",
    name: { en: "Footwear" },
    slug: { en: "footwear" },
    orderHint: "0.3",
    children: [
      { key: "sneakers", name: { en: "Sneakers" }, slug: { en: "sneakers" }, orderHint: "0.31" },
      { key: "boots", name: { en: "Boots" }, slug: { en: "boots" }, orderHint: "0.32" },
    ],
  },
];

async function seedCategories() {
  log("🗂️", "Creating categories...");

  const existing = await api.categories().get({ queryArgs: { limit: 100 } }).execute();
  if (existing.body.results.length > 0) {
    log("⏭️", `Categories already exist (${existing.body.results.length}), skipping.`);
    // Build lookup map from existing categories
    const map = {};
    for (const c of existing.body.results) {
      map[c.key] = c;
    }
    return map;
  }

  const categoryMap = {};

  async function createCategory(catDef, parentId) {
    const body = {
      key: catDef.key,
      name: catDef.name,
      slug: catDef.slug,
      orderHint: catDef.orderHint,
    };
    if (parentId) {
      body.parent = { typeId: "category", id: parentId };
    }

    const result = await api.categories().post({ body }).execute();
    categoryMap[catDef.key] = result.body;
    log("  📁", `${catDef.name.en} (${catDef.key})`);

    if (catDef.children) {
      for (const child of catDef.children) {
        await createCategory(child, result.body.id);
      }
    }
  }

  for (const root of CATEGORY_TREE) {
    await createCategory(root);
  }

  log("✅", `Created ${Object.keys(categoryMap).length} categories`);
  return categoryMap;
}

// ── 4. Products ──────────────────────────────────────────────────────────────

function makeProducts(productType, taxCategory, categories) {
  // Helper to get category ref
  const catRef = (key) => {
    const cat = categories[key];
    if (!cat) return null;
    return { typeId: "category", id: cat.id };
  };

  return [
    {
      key: "classic-oxford-shirt",
      name: { en: "Classic Oxford Shirt" },
      slug: { en: "classic-oxford-shirt" },
      description: { en: "A timeless button-down Oxford shirt in premium cotton. Perfect for both casual and semi-formal occasions." },
      categories: [catRef("mens-shirts")].filter(Boolean),
      masterVariant: {
        sku: "OXF-BLU-M",
        prices: [{ value: { currencyCode: "USD", centAmount: 5999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/4A90D9/ffffff?text=Oxford+Shirt", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Blue" } },
          { name: "size", value: "M" },
          { name: "material", value: "Cotton" },
          { name: "brand", value: "Heritage Basics" },
        ],
      },
      variants: [
        {
          sku: "OXF-BLU-L",
          prices: [{ value: { currencyCode: "USD", centAmount: 5999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Blue" } },
            { name: "size", value: "L" },
            { name: "material", value: "Cotton" },
            { name: "brand", value: "Heritage Basics" },
          ],
        },
        {
          sku: "OXF-WHT-M",
          prices: [{ value: { currencyCode: "USD", centAmount: 5999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "White" } },
            { name: "size", value: "M" },
            { name: "material", value: "Cotton" },
            { name: "brand", value: "Heritage Basics" },
          ],
        },
      ],
    },
    {
      key: "slim-fit-chinos",
      name: { en: "Slim Fit Chinos" },
      slug: { en: "slim-fit-chinos" },
      description: { en: "Modern slim-fit chinos crafted from stretch cotton twill. Comfortable all-day wear with a clean silhouette." },
      categories: [catRef("mens-pants")].filter(Boolean),
      masterVariant: {
        sku: "CHI-KHA-32",
        prices: [{ value: { currencyCode: "USD", centAmount: 7999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/C4A86C/ffffff?text=Slim+Chinos", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Khaki" } },
          { name: "size", value: "32" },
          { name: "material", value: "Cotton Twill" },
          { name: "brand", value: "Heritage Basics" },
        ],
      },
      variants: [
        {
          sku: "CHI-NVY-32",
          prices: [{ value: { currencyCode: "USD", centAmount: 7999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Navy" } },
            { name: "size", value: "32" },
            { name: "material", value: "Cotton Twill" },
            { name: "brand", value: "Heritage Basics" },
          ],
        },
      ],
    },
    {
      key: "floral-blouse",
      name: { en: "Floral Print Blouse" },
      slug: { en: "floral-blouse" },
      description: { en: "An elegant floral print blouse with a relaxed fit. Lightweight fabric ideal for spring and summer." },
      categories: [catRef("womens-tops")].filter(Boolean),
      masterVariant: {
        sku: "BLS-FLR-S",
        prices: [{ value: { currencyCode: "USD", centAmount: 4999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/E88CA5/ffffff?text=Floral+Blouse", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Pink Floral" } },
          { name: "size", value: "S" },
          { name: "material", value: "Polyester" },
          { name: "brand", value: "Bloom Studio" },
        ],
      },
      variants: [
        {
          sku: "BLS-FLR-M",
          prices: [{ value: { currencyCode: "USD", centAmount: 4999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Pink Floral" } },
            { name: "size", value: "M" },
            { name: "material", value: "Polyester" },
            { name: "brand", value: "Bloom Studio" },
          ],
        },
      ],
    },
    {
      key: "wrap-midi-dress",
      name: { en: "Wrap Midi Dress" },
      slug: { en: "wrap-midi-dress" },
      description: { en: "A flattering wrap-style midi dress in a rich emerald tone. Versatile enough for work or weekend." },
      categories: [catRef("womens-dresses")].filter(Boolean),
      masterVariant: {
        sku: "DRS-EMR-S",
        prices: [{ value: { currencyCode: "USD", centAmount: 8999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/2ECC71/ffffff?text=Wrap+Dress", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Emerald" } },
          { name: "size", value: "S" },
          { name: "material", value: "Jersey" },
          { name: "brand", value: "Bloom Studio" },
        ],
      },
      variants: [
        {
          sku: "DRS-EMR-M",
          prices: [{ value: { currencyCode: "USD", centAmount: 8999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Emerald" } },
            { name: "size", value: "M" },
            { name: "material", value: "Jersey" },
            { name: "brand", value: "Bloom Studio" },
          ],
        },
        {
          sku: "DRS-BLK-S",
          prices: [{ value: { currencyCode: "USD", centAmount: 8999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Black" } },
            { name: "size", value: "S" },
            { name: "material", value: "Jersey" },
            { name: "brand", value: "Bloom Studio" },
          ],
        },
      ],
    },
    {
      key: "leather-tote-bag",
      name: { en: "Leather Tote Bag" },
      slug: { en: "leather-tote-bag" },
      description: { en: "A spacious leather tote with interior pockets and a magnetic clasp. Ideal for everyday essentials." },
      categories: [catRef("bags")].filter(Boolean),
      masterVariant: {
        sku: "BAG-TAN-OS",
        prices: [{ value: { currencyCode: "USD", centAmount: 12999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/A0522D/ffffff?text=Leather+Tote", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Tan" } },
          { name: "size", value: "One Size" },
          { name: "material", value: "Full-grain Leather" },
          { name: "brand", value: "Urban Carry" },
        ],
      },
      variants: [
        {
          sku: "BAG-BLK-OS",
          prices: [{ value: { currencyCode: "USD", centAmount: 12999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Black" } },
            { name: "size", value: "One Size" },
            { name: "material", value: "Full-grain Leather" },
            { name: "brand", value: "Urban Carry" },
          ],
        },
      ],
    },
    {
      key: "classic-chronograph",
      name: { en: "Classic Chronograph Watch" },
      slug: { en: "classic-chronograph" },
      description: { en: "A stainless-steel chronograph with sapphire crystal and 50m water resistance. Swiss movement." },
      categories: [catRef("watches")].filter(Boolean),
      masterVariant: {
        sku: "WCH-SLV-OS",
        prices: [{ value: { currencyCode: "USD", centAmount: 24999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/C0C0C0/333333?text=Chronograph", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Silver" } },
          { name: "size", value: "One Size" },
          { name: "material", value: "Stainless Steel" },
          { name: "brand", value: "TimeCraft" },
        ],
      },
      variants: [
        {
          sku: "WCH-GLD-OS",
          prices: [{ value: { currencyCode: "USD", centAmount: 29999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Gold" } },
            { name: "size", value: "One Size" },
            { name: "material", value: "Stainless Steel" },
            { name: "brand", value: "TimeCraft" },
          ],
        },
      ],
    },
    {
      key: "urban-runner-sneakers",
      name: { en: "Urban Runner Sneakers" },
      slug: { en: "urban-runner-sneakers" },
      description: { en: "Lightweight mesh sneakers with cushioned sole. Built for comfort whether you're running or just running errands." },
      categories: [catRef("sneakers")].filter(Boolean),
      masterVariant: {
        sku: "SNK-WHT-10",
        prices: [{ value: { currencyCode: "USD", centAmount: 9999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/F0F0F0/333333?text=Sneakers", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "White" } },
          { name: "size", value: "10" },
          { name: "material", value: "Mesh/Rubber" },
          { name: "brand", value: "StrideX" },
        ],
      },
      variants: [
        {
          sku: "SNK-BLK-10",
          prices: [{ value: { currencyCode: "USD", centAmount: 9999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Black" } },
            { name: "size", value: "10" },
            { name: "material", value: "Mesh/Rubber" },
            { name: "brand", value: "StrideX" },
          ],
        },
        {
          sku: "SNK-WHT-11",
          prices: [{ value: { currencyCode: "USD", centAmount: 9999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "White" } },
            { name: "size", value: "11" },
            { name: "material", value: "Mesh/Rubber" },
            { name: "brand", value: "StrideX" },
          ],
        },
      ],
    },
    {
      key: "chelsea-leather-boots",
      name: { en: "Chelsea Leather Boots" },
      slug: { en: "chelsea-leather-boots" },
      description: { en: "Classic pull-on Chelsea boots in full-grain leather. Elastic side panels and a durable rubber sole." },
      categories: [catRef("boots")].filter(Boolean),
      masterVariant: {
        sku: "BTS-BRN-10",
        prices: [{ value: { currencyCode: "USD", centAmount: 15999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/8B4513/ffffff?text=Chelsea+Boots", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Brown" } },
          { name: "size", value: "10" },
          { name: "material", value: "Full-grain Leather" },
          { name: "brand", value: "StrideX" },
        ],
      },
      variants: [
        {
          sku: "BTS-BLK-10",
          prices: [{ value: { currencyCode: "USD", centAmount: 15999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Black" } },
            { name: "size", value: "10" },
            { name: "material", value: "Full-grain Leather" },
            { name: "brand", value: "StrideX" },
          ],
        },
      ],
    },
    {
      key: "linen-summer-shirt",
      name: { en: "Linen Summer Shirt" },
      slug: { en: "linen-summer-shirt" },
      description: { en: "A breathable linen shirt with a relaxed collar. The perfect warm-weather essential." },
      categories: [catRef("mens-shirts")].filter(Boolean),
      masterVariant: {
        sku: "LIN-WHT-M",
        prices: [{ value: { currencyCode: "USD", centAmount: 6999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/FAF0E6/333333?text=Linen+Shirt", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "White" } },
          { name: "size", value: "M" },
          { name: "material", value: "Linen" },
          { name: "brand", value: "Heritage Basics" },
        ],
      },
      variants: [
        {
          sku: "LIN-SKY-M",
          prices: [{ value: { currencyCode: "USD", centAmount: 6999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Sky Blue" } },
            { name: "size", value: "M" },
            { name: "material", value: "Linen" },
            { name: "brand", value: "Heritage Basics" },
          ],
        },
        {
          sku: "LIN-WHT-L",
          prices: [{ value: { currencyCode: "USD", centAmount: 6999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "White" } },
            { name: "size", value: "L" },
            { name: "material", value: "Linen" },
            { name: "brand", value: "Heritage Basics" },
          ],
        },
      ],
    },
    {
      key: "canvas-backpack",
      name: { en: "Canvas Backpack" },
      slug: { en: "canvas-backpack" },
      description: { en: "A rugged canvas backpack with leather trim and a padded laptop compartment. Built to last." },
      categories: [catRef("bags")].filter(Boolean),
      masterVariant: {
        sku: "BPK-OLV-OS",
        prices: [{ value: { currencyCode: "USD", centAmount: 8999 }, country: "US" }],
        images: [{ url: "https://placehold.co/600x800/556B2F/ffffff?text=Canvas+Backpack", dimensions: { w: 600, h: 800 } }],
        attributes: [
          { name: "color", value: { en: "Olive" } },
          { name: "size", value: "One Size" },
          { name: "material", value: "Canvas/Leather" },
          { name: "brand", value: "Urban Carry" },
        ],
      },
      variants: [
        {
          sku: "BPK-GRY-OS",
          prices: [{ value: { currencyCode: "USD", centAmount: 8999 }, country: "US" }],
          attributes: [
            { name: "color", value: { en: "Grey" } },
            { name: "size", value: "One Size" },
            { name: "material", value: "Canvas/Leather" },
            { name: "brand", value: "Urban Carry" },
          ],
        },
      ],
    },
  ];
}

async function seedProducts(productType, taxCategory, categories) {
  log("👕", "Creating products...");

  const existing = await api.products().get({ queryArgs: { limit: 1 } }).execute();
  if (existing.body.results.length > 0) {
    log("⏭️", `Products already exist (${existing.body.total}), skipping.`);
    return;
  }

  const products = makeProducts(productType, taxCategory, categories);

  for (const product of products) {
    const body = {
      key: product.key,
      name: product.name,
      slug: product.slug,
      description: product.description,
      productType: { typeId: "product-type", id: productType.id },
      taxCategory: { typeId: "tax-category", id: taxCategory.id },
      categories: product.categories,
      masterVariant: product.masterVariant,
      variants: product.variants,
      publish: true,
    };

    await api.products().post({ body }).execute();
    log("  🛍️", `${product.name.en} (${product.key})`);
    await sleep(200); // gentle on API rate limits
  }

  log("✅", `Created ${products.length} products`);
}

// ── 5. Shipping ──────────────────────────────────────────────────────────────

async function seedShipping(taxCategory) {
  log("🚚", "Creating shipping zones and methods...");

  // Check if shipping methods exist
  const existingMethods = await api.shippingMethods().get().execute();
  if (existingMethods.body.results.length > 0) {
    log("⏭️", `Shipping methods already exist (${existingMethods.body.results.length}), skipping.`);
    return;
  }

  // Create zone
  const zone = await api
    .zones()
    .post({
      body: {
        key: "us-zone",
        name: "United States",
        description: "Continental US shipping zone",
        locations: [{ country: "US" }],
      },
    })
    .execute();
  log("  🌍", `Zone: ${zone.body.name}`);

  // Standard shipping
  const standard = await api
    .shippingMethods()
    .post({
      body: {
        key: "standard-shipping",
        name: "Standard Shipping",
        description: "Delivery in 5-7 business days",
        taxCategory: { typeId: "tax-category", id: taxCategory.id },
        zoneRates: [
          {
            zone: { typeId: "zone", id: zone.body.id },
            shippingRates: [
              {
                price: { currencyCode: "USD", centAmount: 599 },
                freeAbove: { currencyCode: "USD", centAmount: 7500 },
              },
            ],
          },
        ],
        isDefault: true,
      },
    })
    .execute();
  log("  📦", `Shipping: ${standard.body.name} ($5.99, free over $75)`);

  // Express shipping
  const express = await api
    .shippingMethods()
    .post({
      body: {
        key: "express-shipping",
        name: "Express Shipping",
        description: "Delivery in 1-2 business days",
        taxCategory: { typeId: "tax-category", id: taxCategory.id },
        zoneRates: [
          {
            zone: { typeId: "zone", id: zone.body.id },
            shippingRates: [
              {
                price: { currencyCode: "USD", centAmount: 1499 },
              },
            ],
          },
        ],
        isDefault: false,
      },
    })
    .execute();
  log("  ⚡", `Shipping: ${express.body.name} ($14.99)`);

  log("✅", "Shipping zones and methods created");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  CT B2C Storefront — Sample Data Seed");
  console.log("  Project: " + projectKey);
  console.log("  API: " + apiUrl);
  console.log("═".repeat(60) + "\n");

  try {
    const taxCategory = await seedTaxCategories();
    const productType = await seedProductTypes();
    const categories = await seedCategories();
    await seedProducts(productType, taxCategory, categories);
    await seedShipping(taxCategory);

    console.log("\n" + "═".repeat(60));
    console.log("  ✅ Seed complete!");
    console.log("═".repeat(60) + "\n");

    // Summary
    const [cats, prods, types, taxes, zones, methods] = await Promise.all([
      api.categories().get({ queryArgs: { limit: 0 } }).execute(),
      api.products().get({ queryArgs: { limit: 0 } }).execute(),
      api.productTypes().get({ queryArgs: { limit: 0 } }).execute(),
      api.taxCategories().get({ queryArgs: { limit: 0 } }).execute(),
      api.zones().get({ queryArgs: { limit: 0 } }).execute(),
      api.shippingMethods().get({ queryArgs: { limit: 0 } }).execute(),
    ]);

    console.log("📊 Project Summary:");
    console.log(`   Categories:       ${cats.body.total}`);
    console.log(`   Products:         ${prods.body.total}`);
    console.log(`   Product Types:    ${types.body.total}`);
    console.log(`   Tax Categories:   ${taxes.body.total}`);
    console.log(`   Zones:            ${zones.body.total}`);
    console.log(`   Shipping Methods: ${methods.body.total}`);
    console.log("");
  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
    if (err.body) {
      console.error("CT Error:", JSON.stringify(err.body, null, 2));
    }
    process.exit(1);
  }
}

main();
