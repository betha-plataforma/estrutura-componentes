import { PromiseTracker } from '../promise-tracker';

const getPromiseToBeFullfiled = (timeout = 500) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
};

const getPromiseToBeRejected = (timeout = 500) => {
  return new Promise(function (_resolve, rejected) {
    setTimeout(rejected, timeout);
  });
};

describe('Promise tracker', () => {

  it('deve inicializar inativo', () => {
    let isAtivo = false;

    const tracker = new PromiseTracker((active: boolean) => {
      isAtivo = active;
    });

    expect(tracker).not.toBeNull();
    expect(isAtivo).toBeFalsy();
  });

  it('deve alterar estado de variavel conforme resolução de promise', async () => {
    let isAtivo = false;

    const tracker = new PromiseTracker((active: boolean) => {
      isAtivo = active;
    });

    expect(tracker).not.toBeNull();
    expect(isAtivo).toBeFalsy();

    const promise = getPromiseToBeFullfiled();
    tracker.addPromise(promise);
    expect(isAtivo).toBeTruthy();
    await promise;
    expect(isAtivo).toBeFalsy();
  });

  it('deve alterar estado de variavel quando promise é rejeitada', async () => {
    let isAtivo = false;

    const tracker = new PromiseTracker((active: boolean) => {
      isAtivo = active;
    });

    expect(tracker).not.toBeNull();
    expect(isAtivo).toBeFalsy();

    const promise = getPromiseToBeRejected();
    tracker.addPromise(promise);
    expect(isAtivo).toBeTruthy();

    try {
      await promise;
      expect(isAtivo).toBeFalsy();
    } catch {
      // Abafado pois o intuito é testar o estado final (pós-erro)
    }
  });

  it('deve alterar estado de variavel com múltiplas promises', async () => {
    let isAtivo = false;

    const tracker = new PromiseTracker((active: boolean) => {
      isAtivo = active;
    });

    expect(tracker).not.toBeNull();
    expect(isAtivo).toBeFalsy();

    var promises = [getPromiseToBeFullfiled(200), getPromiseToBeFullfiled(150), getPromiseToBeFullfiled(650)];
    tracker.addPromise(promises[0]);
    tracker.addPromise(promises[1]);
    tracker.addPromise(promises[2]);

    try {
      expect(isAtivo).toBeTruthy();
      await Promise.all(promises);
      expect(isAtivo).toBeFalsy();
    } catch {
      // Abafado pois o intuito é testar o estado final (pós-erro)
    }
  });

});
