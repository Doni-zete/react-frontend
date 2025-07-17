/**
 * @method somarPorChave
 * @description Soma valores de uma coluna numérica agrupando por uma coluna de chave.
 * @param {any[]} data - Os dados do Excel.
 * @param {number} idxChave - O índice da coluna que será usada como chave para agrupar.
 * @param {number} idxValor - O índice da coluna numérica cujos valores serão somados.
 * @returns {Array<{ name: string, value: number }>} Um array de objetos com o nome da chave e a soma dos valores.
 */
export function somarPorChave(data: any[], idxChave: number, idxValor: number) {
  const soma: Record<string, number> = {};
  data.forEach(row => {
    const chave = row[idxChave] ?? 'Vazio'; // Usa 'Vazio' se a chave for nula/indefinida
    const valor = Number(row[idxValor]) || 0; // Converte para número, 0 se não for um número
    soma[chave] = (soma[chave] || 0) + valor; // Soma o valor à chave existente ou inicia com 0
  });
  return Object.entries(soma).map(([name, value]) => ({ name, value })); // Converte o objeto em um array de objetos
}

/**
 * @method contarOcorrencias
 * @description Conta as ocorrências de cada valor em uma coluna específica.
 * @param {any[]} data - Os dados do Excel.
 * @param {number} idx - O índice da coluna cujas ocorrências serão contadas.
 * @returns {Array<{ name: string, value: number }>} Um array de objetos com o nome da ocorrência e sua contagem.
 */
export function contarOcorrencias(data: any[], idx: number) {
  const contagem: Record<string, number> = {};
  data.forEach(row => {
    const chave = row[idx] ?? 'Vazio'; // Usa 'Vazio' se a chave for nula/indefinida
    contagem[chave] = (contagem[chave] || 0) + 1; // Incrementa a contagem para a chave ou inicia com 1
  });
  return Object.entries(contagem).map(([name, value]) => ({ name, value })); // Converte o objeto em um array de objetos
}

/**
 * @method getQtdPorStatus
 * @description Retorna a quantidade de ocorrências para um status específico em uma lista de dados de status.
 * @param {{ name: string, value: number }[]} dadosStatus - Array de objetos com nome do status e sua contagem.
 * @param {string} status - O status a ser filtrado (ex: 'pendente', 'concluido').
 * @returns {number} A soma das quantidades para o status fornecido.
 */
export function getQtdPorStatus(dadosStatus: { name: string, value: number }[], status: string) {
  return dadosStatus
    .filter(s => s.name && s.name.toString().toLowerCase().includes(status.toLowerCase())) // Filtra os status que contêm o termo desejado
    .reduce((acc, s) => acc + s.value, 0); // Soma as quantidades dos status filtrados
}

/**
 * @method getStatusCountByItem
 * @description Calcula a contagem de cada tipo de status para cada item.
 * @param {any[]} data - Os dados do Excel.
 * @param {number} idxItem - O índice da coluna 'Nome do Item'.
 * @param {number} idxStatus - O índice da coluna 'Status do Pedido'.
 * @returns {Record<string, Record<string, number>>} Um objeto onde a chave é o nome do item e o valor é um objeto com as contagens de status.
 */
export function getStatusCountByItem(data: any[], idxItem: number, idxStatus: number) {
  const result: Record<string, Record<string, number>> = {};
  data.forEach(row => {
    const item = row[idxItem] ?? 'Vazio';
    const status = (row[idxStatus] ?? '').toString().toLowerCase();

    if (!result[item]) {
      // Inicializa o objeto de contagem de status para o item
      result[item] = { pendente: 0, concluido: 0, 'concluído': 0, 'não pago': 0, 'nao pago': 0, cancelado: 0, total: 0 };
    }

    // Incrementa a contagem para cada status
    if (status.includes('pendente')) result[item].pendente += 1;
    if (status.includes('concluido')) result[item].concluido += 1;
    if (status.includes('concluído')) result[item]['concluído'] += 1;
    if (status.includes('não pago')) result[item]['não pago'] += 1;
    if (status.includes('nao pago')) result[item]['nao pago'] += 1;
    if (status.includes('cancelado')) result[item].cancelado += 1;
    result[item].total += 1;
  });

  // Unifica contagens de status com grafias diferentes (ex: 'concluido' e 'concluído')
  Object.keys(result).forEach(item => {
    result[item].concluido = (result[item].concluido || 0) + (result[item]['concluído'] || 0);
    result[item]['não pago'] = (result[item]['não pago'] || 0) + (result[item]['nao pago'] || 0);
    delete result[item]['concluído']; // Remove a chave duplicada
    delete result[item]['nao pago']; // Remove a chave duplicada
  });

  return result;
}