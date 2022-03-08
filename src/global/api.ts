import { isNill } from '../utils/functions';
import { Authorization, AuthorizationConfig } from './interfaces';

const UNAUTHORIZED_STATUS_CODE = 401;

export const isValidAuthorizationConfig = (authorization: AuthorizationConfig) => {
  if (isNill(authorization)) {
    return false;
  }

  return !isNill(authorization.getAuthorization) && !isNill(authorization.handleUnauthorizedAccess);
};

export interface PaginationQueryParams {
  offset?: number;
  limit?: number;
}

export class Api {

  constructor(
    private authorization: Authorization,
    private handleUnauthorizedAccess: () => Promise<void>,
    private baseUrl: string
  ) { }

  async request(method: string, path: string, retryUnauthorizedAccess: boolean = true): Promise<Response> {
    return await fetch(`${this.baseUrl}/${path}`, { method, headers: this.getHeaders() })
      .then(async response => {
        if (response.status === UNAUTHORIZED_STATUS_CODE && retryUnauthorizedAccess && this.handleUnauthorizedAccess !== undefined) {
          await this.handleUnauthorizedAccess();
          return await this.request(method, path, false);
        }

        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }

        return Promise.resolve(response);
      });
  }

  private getHeaders(): Headers {
    const headers = new Headers();

    headers.append('Authorization', 'bearer ' + this.authorization.accessToken);

    if (this.authorization.userAccess !== undefined) {
      headers.append('User-Access', this.authorization.userAccess);
    }

    return headers;
  }
}
