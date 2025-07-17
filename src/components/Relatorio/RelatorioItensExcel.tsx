//import { useState } from 'react';
//import * as XLSX from 'xlsx';
//import {
//  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
//} from 'recharts';

//const COLUNAS_DESEJADAS = [
//  'Status do Pedido',
//  'Horário do pedido',
//  'Nome da loja',
//  'Nome do Item',
//  'Preço(R$)',
//  'Qtd',
//  'Valor de Compra(R$)',
//  'Valor do Reembolso(R$)',
//  'Canal',
//  'Comissão líquida do afiliado(R$)',
//];

//function somarPorChave(data: any[], idxChave: number, idxValor: number) {
//  const soma: Record<string, number> = {};
//  data.forEach(row => {
//    const chave = row[idxChave] ?? 'Vazio';
//    const valor = Number(row[idxValor]) || 0;
//    soma[chave] = (soma[chave] || 0) + valor;
//  });
//  return Object.entries(soma).map(([name, value]) => ({ name, value }));
//}

//function contarOcorrencias(data: any[], idx: number) {
//  const contagem: Record<string, number> = {};
//  data.forEach(row => {
//    const chave = row[idx] ?? 'Vazio';
//    contagem[chave] = (contagem[chave] || 0) + 1;
//  });
//  return Object.entries(contagem).map(([name, value]) => ({ name, value }));
//}

//function excelDateToJSDate(serial: number) {
//  if (!serial || isNaN(serial)) return '';
//  const utc_days = Math.floor(serial - 25569);
//  const utc_value = utc_days * 86400;
//  const date_info = new Date(utc_value * 1000);
//  const fractional_day = serial - Math.floor(serial);
//  const total_seconds = Math.round(86400 * fractional_day);
//  const hours = Math.floor(total_seconds / 3600);
//  const minutes = Math.floor((total_seconds - (hours * 3600)) / 60);
//  const dia = String(date_info.getUTCDate()).padStart(2, '0');
//  const mes = String(date_info.getUTCMonth() + 1).padStart(2, '0');
//  const ano = date_info.getUTCFullYear();
//  const hora = String(hours).padStart(2, '0');
//  const minuto = String(minutes).padStart(2, '0');
//  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
//}

//function getRowBackgroundColor(status: string) {
//  if (!status) return '';
//  const statusLower = status.toString().toLowerCase();
//  if (statusLower.includes('cancelado')) return '#f00505';
//  if (statusLower.includes('concluido') || statusLower.includes('concluído')) return '#92fcaf';
//  if (statusLower.includes('pendente')) return '#edda07';
//  return '';
//}

//function getQtdPorStatus(dadosStatus: { name: string, value: number }[], status: string) {
//  return dadosStatus
//    .filter(s => s.name && s.name.toString().toLowerCase().includes(status))
//    .reduce((acc, s) => acc + s.value, 0);
//}

//// Função para calcular contagem de status por item
//function getStatusCountByItem(data: any[], idxItem: number, idxStatus: number) {
//  const result: Record<string, Record<string, number>> = {};
//  data.forEach(row => {
//    const item = row[idxItem] ?? 'Vazio';
//    const status = (row[idxStatus] ?? '').toString().toLowerCase();
//    if (!result[item]) {
//      result[item] = { pendente: 0, concluido: 0, 'concluído': 0, 'não pago': 0, 'nao pago': 0, cancelado: 0, total: 0 };
//    }
//    if (status.includes('pendente')) result[item].pendente += 1;
//    if (status.includes('concluido')) result[item].concluido += 1;
//    if (status.includes('concluído')) result[item]['concluído'] += 1;
//    if (status.includes('não pago')) result[item]['não pago'] += 1;
//    if (status.includes('nao pago')) result[item]['nao pago'] += 1;
//    if (status.includes('cancelado')) result[item].cancelado += 1;
//    result[item].total += 1;
//  });
//  // Unifica concluido/concluído e não pago/nao pago
//  Object.keys(result).forEach(item => {
//    result[item].concluido = (result[item].concluido || 0) + (result[item]['concluído'] || 0);
//    result[item]['não pago'] = (result[item]['não pago'] || 0) + (result[item]['nao pago'] || 0);
//  });
//  return result;
//}

//// Função para retornar cor do status
//function getStatusColor(tipo: string) {
//  switch (tipo) {
//    case 'pendente':
//      return '#edda07'; // amarelo
//    case 'concluido':
//      return '#92fcaf'; // verde
//    case 'não pago':
//      return '#444'; // cinza escuro
//    case 'cancelado':
//      return '#f00505'; // vermelho
//    default:
//      return '';
//  }
//}

//export default function RelatorioItensExcel() {
//  const [excelData, setExcelData] = useState<any[]>([]);
//  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
//  const [excelMessage, setExcelMessage] = useState('');
//  const [excelFileName, setExcelFileName] = useState('');

//  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//    const file = e.target.files?.[0];
//    if (!file) return;
//    setExcelFileName(file.name);
//    const reader = new FileReader();
//    reader.onload = (evt) => {
//      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
//      const workbook = XLSX.read(data, { type: 'array' });
//      const sheetName = workbook.SheetNames[0];
//      const worksheet = workbook.Sheets[sheetName];
//      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//      if (jsonData.length > 1) {
//        const headers = jsonData[0] as string[];
//        const indices = COLUNAS_DESEJADAS.map(col =>
//          headers.findIndex(h => h?.toLowerCase().trim() === col.toLowerCase().trim())
//        );
//        const filteredData = jsonData.slice(1).map((row: any[]) =>
//          indices.map(idx => row[idx])
//        );
//        setExcelHeaders(COLUNAS_DESEJADAS);
//        setExcelData(filteredData);
//        setExcelMessage('Arquivo importado com sucesso!');
//      } else {
//        setExcelHeaders([]);
//        setExcelData([]);
//        setExcelMessage('Arquivo vazio ou formato inválido.');
//      }
//    };
//    reader.readAsArrayBuffer(file);
//  };

//  const idxStatus = excelHeaders.indexOf('Status do Pedido');
//  const idxLoja = excelHeaders.indexOf('Nome da loja');
//  const idxItem = excelHeaders.indexOf('Nome do Item');
//  const idxPreco = excelHeaders.indexOf('Preço(R$)');
//  const idxQtd = excelHeaders.indexOf('Qtd');
//  const idxCompra = excelHeaders.indexOf('Valor de Compra(R$)');
//  const idxReembolso = excelHeaders.indexOf('Valor do Reembolso(R$)');
//  const idxCanal = excelHeaders.indexOf('Canal');
//  const idxComissao = excelHeaders.indexOf('Comissão líquida do afiliado(R$)');
//  const idxHorario = excelHeaders.indexOf('Horário do pedido');

//  const dadosPreco = idxItem >= 0 && idxPreco >= 0 ? somarPorChave(excelData, idxItem, idxPreco) : [];
//  const dadosQtd = idxItem >= 0 && idxQtd >= 0 ? somarPorChave(excelData, idxItem, idxQtd) : [];
//  const dadosCompra = idxItem >= 0 && idxCompra >= 0 ? somarPorChave(excelData, idxItem, idxCompra) : [];
//  const dadosReembolso = idxItem >= 0 && idxReembolso >= 0 ? somarPorChave(excelData, idxItem, idxReembolso) : [];
//  const dadosComissao = idxItem >= 0 && idxComissao >= 0 ? somarPorChave(excelData, idxItem, idxComissao) : [];

//  const dadosStatus = idxStatus >= 0 ? contarOcorrencias(excelData, idxStatus) : [];
//  const dadosLoja = idxLoja >= 0 ? contarOcorrencias(excelData, idxLoja) : [];
//  const dadosCanal = idxCanal >= 0 ? contarOcorrencias(excelData, idxCanal) : [];

//  // Correção: Definição das variáveis de quantidade de status
//  const qtdPendentes = getQtdPorStatus(dadosStatus, 'pendente');
//  const qtdConcluidos = getQtdPorStatus(dadosStatus, 'concluido') + getQtdPorStatus(dadosStatus, 'concluído');
//  const qtdCancelados = getQtdPorStatus(dadosStatus, 'cancelado');
//  const qtdNaoPagos = getQtdPorStatus(dadosStatus, 'não pago') + getQtdPorStatus(dadosStatus, 'nao pago');

//  // Top 5 Itens Mais Vendidos (por Qtd)
//  const top5Itens = [...dadosQtd]
//    .sort((a, b) => b.value - a.value)
//    .slice(0, 5);

//  // Status por item para o Top 5
//  const statusPorItem = idxItem >= 0 && idxStatus >= 0 ? getStatusCountByItem(excelData, idxItem, idxStatus) : {};

//  let horarioMaisVendeu = null;
//  let produtoMaisVendeu = '';
//  let precoUnitarioMaisVendeu = 0;
//  let totalMaisVendeu = 0;
//  let comissaoTotalMaisVendeu = 0;
//  const dadosHorarioQtd = idxHorario >= 0 && idxQtd >= 0
//    ? somarPorChave(excelData, idxHorario, idxQtd)
//    : [];
//  const dadosHorarioQtdOrdenado = [...dadosHorarioQtd].sort((a, b) => Number(a.name) - Number(b.name));
//  if (dadosHorarioQtd.length > 0 && idxHorario >= 0 && idxQtd >= 0 && idxItem >= 0 && idxPreco >= 0 && idxComissao >= 0) {
//    const maxHorario = dadosHorarioQtd.reduce((max, curr) => curr.value > max.value ? curr : max, dadosHorarioQtd[0]);
//    horarioMaisVendeu = maxHorario;
//    let maiorQtd = 0;
//    let nomeProduto = '';
//    let precoUnitario = 0;
//    let total = 0;
//    let comissaoTotal = 0;
//    excelData.forEach(row => {
//      if (String(row[idxHorario]) === String(maxHorario.name)) {
//        const qtd = Number(row[idxQtd]) || 0;
//        const comissao = Number(row[idxComissao]) || 0;
//        if (qtd > maiorQtd) {
//          maiorQtd = qtd;
//          nomeProduto = row[idxItem];
//          precoUnitario = Number(row[idxPreco]) || 0;
//          total = precoUnitario * qtd;
//        }
//        comissaoTotal += comissao;
//      }
//    });
//    produtoMaisVendeu = nomeProduto;
//    precoUnitarioMaisVendeu = precoUnitario;
//    totalMaisVendeu = total;
//    comissaoTotalMaisVendeu = comissaoTotal;
//  }

//  let maiorComissao = 0;
//  let produtoMaiorComissao = '';
//  if (idxComissao >= 0 && idxItem >= 0) {
//    excelData.forEach(row => {
//      const comissao = Number(row[idxComissao]) || 0;
//      if (comissao > maiorComissao) {
//        maiorComissao = comissao;
//        produtoMaiorComissao = row[idxItem];
//      }
//    });
//  }

//  const somaPreco = idxPreco >= 0 ? excelData.reduce((acc, row) => acc + (Number(row[idxPreco]) || 0), 0) : 0;
//  const somaCompra = idxCompra >= 0 ? excelData.reduce((acc, row) => acc + (Number(row[idxCompra]) || 0), 0) : 0;
//  const somaReembolso = idxReembolso >= 0 ? excelData.reduce((acc, row) => acc + (Number(row[idxReembolso]) || 0), 0) : 0;

//  const somaComissaoPendente =
//    idxStatus >= 0 && idxComissao >= 0
//      ? excelData.reduce((acc, row) => {
//          const status = (row[idxStatus] || '').toString().toLowerCase();
//          if (status.includes('pendente')) {
//            return acc + (Number(row[idxComissao]) || 0);
//          }
//          return acc;
//        }, 0)
//      : 0;

//  const somaComissaoConcluido =
//    idxStatus >= 0 && idxComissao >= 0
//      ? excelData.reduce((acc, row) => {
//          const status = (row[idxStatus] || '').toString().toLowerCase();
//          if (status.includes('concluido') || status.includes('concluído')) {
//            return acc + (Number(row[idxComissao]) || 0);
//          }
//          return acc;
//        }, 0)
//      : 0;

//  const top5Lojas = [...dadosLoja]
//    .sort((a, b) => b.value - a.value)
//    .slice(0, 5);

//  const top5ItensValorCompra = [...dadosCompra]
//    .sort((a, b) => b.value - a.value)
//    .slice(0, 5);

//  let menorData = '';
//  let maiorData = '';
//  if (dadosHorarioQtdOrdenado.length > 0) {
//    menorData = excelDateToJSDate(Number(dadosHorarioQtdOrdenado[0].name));
//    maiorData = excelDateToJSDate(Number(dadosHorarioQtdOrdenado[dadosHorarioQtdOrdenado.length - 1].name));
//  }

//  const idxColComissao = excelHeaders.indexOf('Comissão líquida do afiliado(R$)');

//  const excelDataOrdenado = [...excelData];
//  if (idxHorario >= 0) {
//    excelDataOrdenado.sort((a, b) => {
//      const aNum = Number(a[idxHorario]);
//      const bNum = Number(b[idxHorario]);
//      if (isNaN(aNum) && isNaN(bNum)) return 0;
//      if (isNaN(aNum)) return 1;
//      if (isNaN(bNum)) return -1;
//      return aNum - bNum;
//    });
//  }

//  return (
//    <div style={{ marginTop: 48, background: '#e3f2fd', borderRadius: 12, padding: 24 }}>
//      <h2 style={{ color: '#1976d2', fontFamily: 'monospace' }}>Importar Itens do Excel AffiliateCommissionReport</h2>
//      <input
//        type="file"
//        accept=".xlsx,.xls"
//        onChange={handleExcelUpload}
//        style={{ marginBottom: 16 }}
//      />
//      {excelFileName && <div style={{ marginBottom: 8 }}>Arquivo: <b>{excelFileName}</b></div>}
//      {excelMessage && <div style={{ marginBottom: 16, color: '#388e3c' }}>{excelMessage}</div>}
//      {excelHeaders.length > 0 && excelData.length > 0 && (
//        <>
//          {/* Somas gerais dos campos */}
//          <div style={{ margin: '24px 0', background: '#fffde7', borderRadius: 8, padding: 16, display: 'inline-block' }}>
//            <h3 style={{ margin: 0, color: '#1976d2', fontSize: 18 }}>Soma dos campos:</h3>
//            {menorData && maiorData && (
//              <div style={{ fontSize: 15, marginTop: 8 }}>
//                <b>Período:</b> <b>{menorData} á {maiorData}</b>
//              </div>
//            )}
//            <div style={{ fontSize: 15, marginTop: 8 }}>
//              <b>Preço(R$):</b> {somaPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
//              <br />
//              <b>Quantidade total (pendentes + concluídos):</b> {qtdPendentes + qtdConcluidos}
//              <br />
//              <b>Quantidade total (pendentes + concluídos + não pagos + cancelados):</b> {qtdPendentes + qtdConcluidos + qtdCancelados + qtdNaoPagos}
//              <br />
//              <b>Valor de Compra(R$):</b> {somaCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
//              <br />
//              <b>Valor do Reembolso(R$):</b> {somaReembolso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
//              <br />
//              <b>Comissão líquida do afiliado(R$) (apenas pendentes):</b> {somaComissaoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
//              <br />  
//              <b>Comissão líquida do afiliado(R$) (apenas concluídos):</b> {somaComissaoConcluido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
//              <br />
//            </div>
//            {/* Top 5 itens mais vendidos com detalhamento de status e cores */}
//            <div style={{ fontSize: 15, marginTop: 16 }}>
//              <b>Top 5 Itens Mais Vendidos (por Qtd):</b>
//              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
//                {top5Itens.map((item, idx) => {
//                  const status = statusPorItem[item.name] || {};
//                  return (
//                    <li key={item.name}>
//                      {item.name}: Quantidade de unidade(s): <b>{item.value}</b>
//                      {' | '}
//                      <span style={{ background: getStatusColor('pendente'), padding: '2px 6px', borderRadius: 4 }}>
//                        Pendente: <b>{status.pendente || 0}</b>
//                      </span>
//                      {' | '}
//                      <span style={{ background: getStatusColor('concluido'), padding: '2px 6px', borderRadius: 4 }}>
//                        Concluído: <b>{status.concluido || 0}</b>
//                      </span>
//                      {' | '}
//                      <span style={{ background: getStatusColor('não pago'), color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
//                        Não pago: <b>{status['não pago'] || 0}</b>
//                      </span>
//                      {' | '}
//                      <span style={{ background: getStatusColor('cancelado'), color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
//                        Cancelado: <b>{status.cancelado || 0}</b>
//                      </span>
//                    </li>
//                  );
//                })}
//              </ol>
//            </div>
//            {/* Top 5 lojas por contagem */}
//            <div style={{ fontSize: 15, marginTop: 16 }}>
//              <b>Top 5 Nome da loja (Contagem):</b>
//              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
//                {top5Lojas.map((loja, idx) => (
//                  <li key={loja.name}>
//                    {loja.name}: <b>{loja.value}</b> pedidos
//                  </li>
//                ))}
//              </ol>
//            </div>
//            {/* Top 5 itens por valor de compra */}
//            <div style={{ fontSize: 15, marginTop: 16 }}>
//              <b>Top 5 Nome do Item x Valor de Compra(R$) (Soma):</b>
//              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
//                {top5ItensValorCompra.map((item, idx) => (
//                  <li key={item.name}>
//                    {item.name}: <b>{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>
//                  </li>
//                ))}
//              </ol>
//            </div>
//            {/* Horário do pedido com mais vendas */}
//            <div style={{ fontSize: 15, marginTop: 16 }}>
//              <b>Horário do pedido com mais vendas:</b>{' '}
//              {horarioMaisVendeu ? (
//                <>
//                  {excelDateToJSDate(Number(horarioMaisVendeu.name))}
//                  {produtoMaisVendeu ? ` - ${produtoMaisVendeu}` : ''}
//                  {precoUnitarioMaisVendeu > 0 ? (
//                    <>
//                      : <b>{horarioMaisVendeu.value}</b> unidades
//                      {' | '}Preço unitário: <b>{precoUnitarioMaisVendeu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
//                      {' | '}Total: <b>{totalMaisVendeu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
//                      {' | '}Comissão total: <b>{comissaoTotalMaisVendeu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
//                    </>
//                  ) : (
//                    <>: <b>{horarioMaisVendeu.value}</b> unidades</>
//                  )}
//                </>
//              ) : (
//                'Não disponível'
//              )}
//            </div>
//            {/* Maior comissão líquida do afiliado e produto correspondente */}
//            <div style={{ fontSize: 15, marginTop: 8 }}>
//              <b>Maior Comissão líquida do afiliado(R$):</b>{' '}
//              {maiorComissao > 0
//                ? <span style={{ color: '#388e3c', fontWeight: 'bold' }}>
//                    {maiorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - {produtoMaiorComissao}
//                  </span>
//                : 'Não disponível'}
//            </div>
//          </div>
//          {/* Gráficos */}
//          <div style={{ marginTop: 32 }}>
//            <h3>Gráficos de Barras</h3>
//            <div style={{ fontSize: 14, marginBottom: 8 }}>
//              {menorData && maiorData && (
//                <span>
//                  <b>Período:</b> {menorData} até {maiorData}
//                </span>
//              )}
//            </div>
//            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Status do Pedido (Contagem)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosStatus}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis allowDecimals={false} />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#1976d2" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Nome da loja (Contagem)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosLoja}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis allowDecimals={false} />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#388e3c" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Nome do Item x Preço(R$) (Soma)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosPreco}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#d32f2f" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Nome do Item x Qtd (Soma)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosQtd}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#1976d2" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Nome do Item x Valor de Compra(R$) (Soma)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosCompra}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#fbc02d" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Nome do Item x Valor do Reembolso(R$) (Soma)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosReembolso}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#7b1fa2" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Nome do Item x Comissão líquida do afiliado(R$) (Soma)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosComissao}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#ff9800" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Horário do pedido x Quantidade vendida</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosHorarioQtdOrdenado.map(item => ({
//                    ...item,
//                    name: excelDateToJSDate(Number(item.name))
//                  }))}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis allowDecimals={false} />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#00bcd4" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//              <div style={{ flex: 1, minWidth: 350 }}>
//                <b>Canal (Contagem)</b>
//                <ResponsiveContainer width="100%" height={250}>
//                  <BarChart data={dadosCanal}>
//                    <CartesianGrid strokeDasharray="3 3" />
//                    <XAxis dataKey="name" />
//                    <YAxis allowDecimals={false} />
//                    <Tooltip />
//                    <Legend />
//                    <Bar dataKey="value" fill="#0097a7" />
//                  </BarChart>
//                </ResponsiveContainer>
//              </div>
//            </div>
//          </div>
//          {/* Tabela */}
//          <div style={{ marginTop: 32, overflowX: 'auto' }}>
//            <table style={{ background: '#fff', borderRadius: 8, width: '100%', minWidth: 1000 }}>
//              <thead>
//                <tr>
//                  {excelHeaders.map((h, i) => (
//                    <th key={i} style={{ fontSize: 13, padding: 4 }}>{h}</th>
//                  ))}
//                </tr>
//              </thead>
//              <tbody>
//                {excelDataOrdenado.map((row, i) => {
//                  const status = row[idxStatus];
//                  const bgColor = getRowBackgroundColor(status);
//                  return (
//                    <tr key={i} style={bgColor ? { background: bgColor } : {}}>
//                      {row.map((cell, j) => {
//                        if (j === idxColComissao && Number(cell) === maiorComissao && maiorComissao > 0) {
//                          return (
//                            <td
//                              key={j}
//                              style={{
//                                fontSize: 13,
//                                padding: 4,
//                                textAlign: 'center',
//                                background: '#92fcaf',
//                                fontWeight: 'bold',
//                                color: '#1b5e20'
//                              }}
//                            >
//                              {cell}
//                            </td>
//                          );
//                        }
//                        if (excelHeaders[j] === 'Horário do pedido') {
//                          return (
//                            <td key={j} style={{ fontSize: 13, padding: 4, textAlign: 'center' }}>
//                              {excelDateToJSDate(Number(cell))}
//                            </td>
//                          );
//                        }
//                        return (
//                          <td key={j} style={{ fontSize: 13, padding: 4, textAlign: 'center' }}>
//                            {cell}
//                          </td>
//                        );
//                      })}
//                    </tr>
//                  );
//                })}
//              </tbody>
//            </table>
//          </div>
//        </>
//      )}
//    </div>
//  );
//}