import { isNill } from '../utils/functions';
import { Authorization, AuthorizationConfig } from './interfaces';

const UNAUTHORIZED_STATUS_CODE = 401;
const OK_STATUS_CODE = 200;

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

  async request(method: string, path: string, retryUnauthorizedAccess: boolean = true, returnResponse: boolean = false): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${path}`, { method, headers: this.getHeaders() });

    if (response.status === UNAUTHORIZED_STATUS_CODE && retryUnauthorizedAccess && this.handleUnauthorizedAccess !== undefined) {
      await this.handleUnauthorizedAccess();
      return await this.request(method, path, false, returnResponse);
    }

    if (returnResponse) {
      return response;
    }

    if (response.status !== OK_STATUS_CODE) {
      throw new Error(response.statusText);
    }

    return await response.json().catch(() => null);
  }

  private getHeaders(): Headers {
    const headers = new Headers();

    headers.append('Authorization', 'bearer ' + this.authorization.accessToken);

    return headers;
  }
}
