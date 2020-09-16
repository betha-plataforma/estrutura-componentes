export interface AuthorizationConfig {
  getAuthorization(): Authorization;
  handleUnauthorizedAccess(): Promise<void>,
}

export interface Authorization {
  accessToken: string;
  accessId?: string;
  systemId?: number,
  userId?: string,
}
