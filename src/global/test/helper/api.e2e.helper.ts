// @ts-nocheck
export function setupAuthorization() {
  window.authorization = {
    getAuthorization: () => {
      return {
        accessToken: window.__tests?.authorization?.accessToken || '00000000-1111-2222-3333-5555555555',
        userId: window.__tests?.authorization?.userId || 'default.user',
        systemId: window.__tests?.authorization?.systemId || 1
      };
    },
    handleUnauthorizedAccess: () => {
      return new Promise(resolve => setTimeout(resolve, 300));
    }
  };
}
