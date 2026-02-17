import { Injectable, NotFoundException } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";

interface FindAllParams {
  limit?: number;
  offset?: number;
  category?: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly ct: CommercetoolsService) {}

  async findAll(params: FindAllParams) {
    const { limit = 20, offset = 0, category } = params;
    const api = this.ct.getApiRoot();

    const where: string[] = [];
    if (category) {
      where.push(`categories(id="${category}")`);
    }

    const response = await api
      .productProjections()
      .search()
      .get({
        queryArgs: {
          limit,
          offset,
          filter: where.length ? where : undefined,
        },
      })
      .execute();

    return {
      results: response.body.results,
      total: response.body.total ?? 0,
      limit,
      offset,
    };
  }

  async findBySlug(slug: string) {
    const api = this.ct.getApiRoot();

    const response = await api
      .productProjections()
      .search()
      .get({
        queryArgs: {
          filter: [`slug.en-US:"${slug}"`],
          limit: 1,
        },
      })
      .execute();

    const product = response.body.results[0];
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }
}
