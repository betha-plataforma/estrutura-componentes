import { isNill } from './functions';

/**
 * Retorna de forma textual a data e hora relativa ao tempo atual
 *
 * @param dateTime Data e hora no formato EPOCH (1588008762990) ou ISO string (Ex: 2020-04-22T17:03:28)
 */
export function getDataHoraDescrita(dateTime: number | string): string {
  if (isNill(dateTime)) {
    throw Error('A data e hora deve ser informada');
  }

  const data = new Date(dateTime);
  const dataAgora = new Date();

  const minutos = getDiferencaEmMinutos(data, dataAgora);

  // Menos de 1 minuto
  if (minutos < 1) {
    return 'agora há pouco';
  }

  // Menos de uma hora
  if (minutos < 60) {
    return 'há ' + minutos + ' minuto' + (minutos > 1 ? 's' : '');
  }

  // Menos de 24 horas
  if (minutos < 1440) {
    const horas = Math.trunc(minutos / 60);
    return 'há ' + horas + ' hora' + (horas > 1 ? 's' : '');
  }

  // Mais de 24 horas
  return formatarData(data) + ' às ' + data.toTimeString().substring(0, 5);
}

function formatarData(data: Date) {
  return data.toLocaleString('pt-BR').substring(0, 10);
}

function getDiferencaEmMinutos(dataA: Date, dataB: Date) {
  return Math.floor((dataB.getTime() - dataA.getTime()) / (60 * 1000));
}
