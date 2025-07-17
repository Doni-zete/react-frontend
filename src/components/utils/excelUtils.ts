/**
 * @method excelDateToJSDate
 * @description Converte um número de série de data do Excel para uma string de data e hora formatada.
 * @param {number} serial - O número de série da data do Excel.
 * @returns {string} A data e hora formatada como "dd/mm/yyyy hh:mm" ou string vazia se inválido.
 */
export function excelDateToJSDate(serial: number): string {
  if (!serial || isNaN(serial)) return ''; // Retorna string vazia se o serial for inválido

  // O número 25569 é a diferença entre a data de referência do Excel (01/01/1900) e a de JavaScript (01/01/1970)
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400; // Converte dias para segundos
  const date_info = new Date(utc_value * 1000); // Cria um objeto Date a partir dos segundos (em milissegundos)

  const fractional_day = serial - Math.floor(serial); // Obtém a parte fracionária do dia (tempo)
  const total_seconds = Math.round(86400 * fractional_day); // Converte a fração do dia em segundos

  const hours = Math.floor(total_seconds / 3600); // Calcula as horas
  const minutes = Math.floor((total_seconds - (hours * 3600)) / 60); // Calcula os minutos

  // Formata dia, mês, ano, hora e minuto com dois dígitos
  const dia = String(date_info.getUTCDate()).padStart(2, '0');
  const mes = String(date_info.getUTCMonth() + 1).padStart(2, '0'); // Mês é base 0
  const ano = date_info.getUTCFullYear();
  const hora = String(hours).padStart(2, '0');
  const minuto = String(minutes).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`; // Retorna a data e hora formatadas
}

/**
 * @method getRowBackgroundColor
 * @description Retorna a cor de fundo da linha com base no status do pedido.
 * @param {string} status - O status do pedido.
 * @returns {string} O código hexadecimal da cor ou string vazia se nenhum status corresponder.
 */
export function getRowBackgroundColor(status: string): string {
  if (!status) return '';
  const statusLower = status.toString().toLowerCase();

  if (statusLower.includes('cancelado')) return '#f00505'; // Vermelho para cancelado
  if (statusLower.includes('concluido') || statusLower.includes('concluído')) return '#92fcaf'; // Verde claro para concluído
  if (statusLower.includes('pendente')) return '#edda07'; // Amarelo para pendente
  return ''; // Sem cor se nenhum status corresponder
}

/**
 * @method getStatusColor
 * @description Retorna a cor associada a um tipo de status específico.
 * @param {string} tipo - O tipo de status (ex: 'pendente', 'concluido', 'não pago', 'cancelado').
 * @returns {string} O código hexadecimal da cor.
 */
export function getStatusColor(tipo: string): string {
  switch (tipo) {
    case 'pendente':
      return '#edda07'; // amarelo
    case 'concluido':
      return '#92fcaf'; // verde
    case 'não pago':
      return '#444'; // cinza escuro
    case 'cancelado':
      return '#f00505'; // vermelho
    default:
      return ''; // Cor padrão (transparente)
  }
}