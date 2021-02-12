import { setGlobalOrWindowProperty } from '../../../test/utils/spec.helper';
import { isValidAuthorizationConfig, Api } from '../api';
import { getMockAuthorization } from './helper/api.helper';

describe('Api', () => {

  describe('Authorization', () => {
    it('deve considerar authorization valido', () => {
      const authorization = getMockAuthorization();
      expect(isValidAuthorizationConfig(authorization)).toBeTruthy();
    });

    it('deve considerar auth config invalida 1', () => {
      expect(isValidAuthorizationConfig(null)).toBeFalsy();
      expect(isValidAuthorizationConfig(undefined)).toBeFalsy();
    });

    it('deve considerar auth config invalida 2', () => {
      const authorization = getMockAuthorization();
      authorization.getAuthorization = null;

      expect(isValidAuthorizationConfig(authorization)).toBeFalsy();
    });

    it('deve considerar auth config invalida 3', () => {
      const authorization = getMockAuthorization();
      authorization.handleUnauthorizedAccess = null;

      expect(isValidAuthorizationConfig(authorization)).toBeFalsy();
    });
  });

  describe('Api', () => {
    let fetchMock: any;
    let fetchResponseStatus: number;
    let fetchResponseData: any;

    beforeEach(() => {
      fetchResponseStatus = 200;
      fetchResponseData = { message: 'Hello World' };
      fetchMock = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          status: fetchResponseStatus,
          json: jest.fn().mockImplementation(() => Promise.resolve(fetchResponseData))
        });
      });

      setGlobalOrWindowProperty(global, 'fetch', fetchMock);
    });

    it('deve fazer requisicao', async () => {
      const authorization = getMockAuthorization();
      const { accessToken } = authorization.getAuthorization();

      const baseUrl = 'https://site.com';
      const apiEndpoint = 'api/v1/tests';
      const siteApi = new Api({ accessToken }, () => Promise.resolve(), baseUrl);
      await siteApi .request('GET', apiEndpoint) .then(res => res.json());

      expect(fetchMock).toBeCalledTimes(1);
      const expectedFetchOptions = {
        method: 'GET',
        headers: { '_values': [['Authorization', `bearer ${accessToken}`]] }
      };

      expect(fetchMock).toBeCalledWith(`${baseUrl}/${apiEndpoint}`, expectedFetchOptions);
    });

    it('deve retentar ao receber 401', async () => {
      fetchResponseStatus = 401;

      const authorization = getMockAuthorization();
      const { accessToken } = authorization.getAuthorization();

      const baseUrl = 'https://site.com';
      const apiEndpoint = 'api/v1/tests';

      const handleUnauthorizedAccess = jest.fn().mockImplementation(() => {
        fetchResponseStatus = 200;
        return Promise.resolve();
      });

      const siteApi = new Api({ accessToken }, handleUnauthorizedAccess, baseUrl);
      const response = await siteApi.request('GET', apiEndpoint).then(res => res.json());

      expect(response).not.toBeNull();
      expect(fetchMock).toBeCalledTimes(2);
      expect(handleUnauthorizedAccess).toBeCalledTimes(1);
    });

  });

});
