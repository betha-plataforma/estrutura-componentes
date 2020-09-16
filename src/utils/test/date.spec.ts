import { getDataHoraDescrita } from '../date';

describe('Date utils', () => {
  it('deve lançar erro caso seja informado undefined', () => {
    expect(() => getDataHoraDescrita(undefined)).toThrowError();
  });

  it('deve lançar erro caso seja informado null', () => {
    expect(() => getDataHoraDescrita(null)).toThrowError();
  });

  it('deve formatar data diferença em segundos', () => {
    const agoraIso = new Date().toISOString();
    const resultado = getDataHoraDescrita(agoraIso);
    expect(resultado).toEqual('agora há pouco');
  });

  it('deve formatar data diferença em minutos', () => {
    const data = new Date();
    data.setMinutes(data.getMinutes() - 2);
    const doisMinutosAtrasIso = data.toISOString();
    const resultado = getDataHoraDescrita(doisMinutosAtrasIso);
    expect(resultado).toEqual('há 2 minutos');
  });

  it('deve formatar data diferença em minuto unico', () => {
    const data = new Date();
    data.setMinutes(data.getMinutes() - 1);
    const umMinutoAtrasIso = data.toISOString();
    const resultado = getDataHoraDescrita(umMinutoAtrasIso);
    expect(resultado).toEqual('há 1 minuto');
  });

  it('deve formatar data diferença em horas', () => {
    const data = new Date();
    data.setHours(data.getHours() - 2);
    const duasHorasAtrasIso = data.toISOString();
    const resultado = getDataHoraDescrita(duasHorasAtrasIso);
    expect(resultado).toEqual('há 2 horas');
  });

  it('deve formatar data diferença em hora unica', () => {
    const data = new Date();
    data.setHours(data.getHours() - 1);
    const umaHoraAtrasIso = data.toISOString();
    const resultado = getDataHoraDescrita(umaHoraAtrasIso);
    expect(resultado).toEqual('há 1 hora');
  });

  it('deve formatar data que não é de hoje', () => {
    const data = new Date();
    data.setDate(data.getDate() - 2);
    const doisDiasAtrasIso = data.toISOString();
    const resultado = getDataHoraDescrita(doisDiasAtrasIso);
    expect(resultado).toEqual(`${data.toLocaleString('pt-BR').substring(0, 10)} às ${data.toTimeString().substring(0, 5)}`);
  });
});
