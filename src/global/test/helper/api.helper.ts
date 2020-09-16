import { AuthorizationConfig, Authorization } from '../../interfaces';

export function getMockAuthorization(): AuthorizationConfig {
  const authorization: AuthorizationConfig = {
    getAuthorization: (): Authorization => {
      return {
        accessToken: '00000000-1111-2222-3333-5555555555',
        userId: 'lorem.ipsum',
        systemId: 666
      };
    },
    handleUnauthorizedAccess: () => Promise.resolve()
  };

  return authorization;
}
