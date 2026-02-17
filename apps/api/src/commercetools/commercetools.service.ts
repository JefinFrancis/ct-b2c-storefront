/**
 * CommercetoolsService — wraps all CT SDK client initialisation.
 * The ONLY place in the codebase that imports the CT SDK client builder.
 * Exposes typed API roots for each auth flow.
 */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientBuilder } from "@commercetools/sdk-client-v2";
import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";

@Injectable()
export class CommercetoolsService {
  constructor(private config: ConfigService) {}

  private get cfg() {
    return {
      projectKey: this.config.getOrThrow<string>("CTP_PROJECT_KEY"),
      clientId: this.config.getOrThrow<string>("CTP_CLIENT_ID"),
      clientSecret: this.config.getOrThrow<string>("CTP_CLIENT_SECRET"),
      authUrl: this.config.getOrThrow<string>("CTP_AUTH_URL"),
      apiUrl: this.config.getOrThrow<string>("CTP_API_URL"),
      scopes: this.config.getOrThrow<string>("CTP_SCOPES").split(" "),
    };
  }

  /** Client credentials — catalog reads, admin operations */
  getApiRoot() {
    const { projectKey, clientId, clientSecret, authUrl, apiUrl, scopes } =
      this.cfg;
    const client = new ClientBuilder()
      .withClientCredentialsFlow({
        host: authUrl,
        projectKey,
        credentials: { clientId, clientSecret },
        scopes,
        fetch,
      })
      .withHttpMiddleware({ host: apiUrl, fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  /** Password flow — authenticated customer operations */
  getCustomerApiRoot(username: string, password: string) {
    const { projectKey, clientId, clientSecret, authUrl, apiUrl, scopes } =
      this.cfg;
    const client = new ClientBuilder()
      .withPasswordFlow({
        host: authUrl,
        projectKey,
        credentials: {
          clientId,
          clientSecret,
          user: { username, password },
        },
        scopes,
        fetch,
      })
      .withHttpMiddleware({ host: apiUrl, fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  /** Anonymous flow — guest cart and checkout */
  getAnonymousApiRoot(anonymousId?: string) {
    const { projectKey, clientId, clientSecret, authUrl, apiUrl, scopes } =
      this.cfg;
    const client = new ClientBuilder()
      .withAnonymousSessionFlow({
        host: authUrl,
        projectKey,
        credentials: {
          clientId,
          clientSecret,
          anonymousId,
        },
        scopes,
        fetch,
      })
      .withHttpMiddleware({ host: apiUrl, fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }
}
