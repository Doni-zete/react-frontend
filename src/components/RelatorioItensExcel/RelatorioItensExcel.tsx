import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useExcelData } from '../hooks/useExcelData';
import { excelDateToJSDate, getRowBackgroundColor, getStatusColor } from '../utils/excelUtils';
import { getQtdPorStatus, getStatusCountByItem } from '../utils/dataProcessing';

// Colunas desejadas do arquivo Excel
const COLUNAS_DESEJADAS = [
  'Status do Pedido',
  'Horário do pedido',
  'Nome da loja',
  'Nome do Item',
  'Preço(R$)',
  'Qtd',
  'Valor de Compra(R$)',
  'Valor do Reembolso(R$)',
  'Canal',
  'Comissão líquida do afiliado(R$)',
];

export default function RelatorioItensExcel() {
  // Hook customizado para gerenciar a lógica de importação e processamento dos dados do Excel
  const {
    excelData,
    excelHeaders,
    excelMessage,
    excelFileName,
    handleExcelUpload,
    indices,
    dadosPreco,
    dadosQtd,
    dadosCompra,
    dadosReembolso,
    dadosComissao,
    dadosStatus,
    dadosLoja,
    dadosCanal,
    somaPreco,
    somaCompra,
    somaReembolso,
    somaComissaoPendente,
    somaComissaoConcluido,
    top5Itens,
    top5Lojas,
    top5ItensValorCompra,
    horarioMaisVendeu,
    produtoMaisVendeu,
    precoUnitarioMaisVendeu,
    totalMaisVendeu,
    comissaoTotalMaisVendeu,
    maiorComissao,
    produtoMaiorComissao,
    menorData,
    maiorData,
    excelDataOrdenado
  } = useExcelData(COLUNAS_DESEJADAS);

  // Desestruturação dos índices para facilitar o acesso
  const { idxStatus, idxItem, idxComissao, idxHorario } = indices;

  // Calcula as quantidades de pedidos por status para exibição
  const qtdPendentes = getQtdPorStatus(dadosStatus, 'pendente');
  const qtdConcluidos = getQtdPorStatus(dadosStatus, 'concluido') + getQtdPorStatus(dadosStatus, 'concluído');
  const qtdCancelados = getQtdPorStatus(dadosStatus, 'cancelado');
  const qtdNaoPagos = getQtdPorStatus(dadosStatus, 'não pago') + getQtdPorStatus(dadosStatus, 'nao pago');

  // Obtém a contagem de status por item para os top 5 itens mais vendidos
  const statusPorItem = idxItem >= 0 && idxStatus >= 0 ? getStatusCountByItem(excelData, idxItem, idxStatus) : {};

  return (
    <div style={{ marginTop: 48, background: '#e3f2fd', borderRadius: 12, padding: 24 }}>
      <h2 style={{ color: '#1976d2', fontFamily: 'monospace' }}>Importar Itens do Excel AffiliateCommissionReport</h2>
      {/* Input para upload do arquivo Excel */}
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelUpload}
        style={{ marginBottom: 16 }}
      />
      {/* Exibe o nome do arquivo importado */}
      {excelFileName && <div style={{ marginBottom: 8 }}>Arquivo: <b>{excelFileName}</b></div>}
      {/* Exibe mensagens de sucesso ou erro na importação */}
      {excelMessage && <div style={{ marginBottom: 16, color: '#388e3c' }}>{excelMessage}</div>}
      {excelHeaders.length > 0 && excelData.length > 0 && (
        <>
          {/* Seção de Somas Gerais e Indicadores Chave */}
          <div style={{ margin: '24px 0', background: '#fffde7', borderRadius: 8, padding: 16, display: 'inline-block' }}>
            <h3 style={{ margin: 0, color: '#1976d2', fontSize: 18 }}>Soma dos campos:</h3>
            {/* Exibe o período dos dados */}
            {menorData && maiorData && (
              <div style={{ fontSize: 15, marginTop: 8 }}>
                <b>Período:</b> <b>{menorData} á {maiorData}</b>
              </div>
            )}
            <div style={{ fontSize: 15, marginTop: 8 }}>
              {/* Exibição das somas e quantidades totais */}
              <b>Preço(R$):</b> {somaPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <br />
              <b>Quantidade total (pendentes + concluídos):</b> {qtdPendentes + qtdConcluidos}
              <br />
              <b>Quantidade total (pendentes + concluídos + não pagos + cancelados):</b> {qtdPendentes + qtdConcluidos + qtdCancelados + qtdNaoPagos}
              <br />
              <b>Valor de Compra(R$):</b> {somaCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <br />
              <b>Valor do Reembolso(R$):</b> {somaReembolso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <br />
              <b>Comissão líquida do afiliado(R$) (apenas pendentes):</b> {somaComissaoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <br />
              <b>Comissão líquida do afiliado(R$) (apenas concluídos):</b> {somaComissaoConcluido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <br />
            </div>
            {/* Top 5 itens mais vendidos com detalhamento de status e cores */}
            <div style={{ fontSize: 15, marginTop: 16 }}>
              <b>Top 10 Itens Mais Vendidos (por Qtd):</b>
              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                {top5Itens.map((item, idx) => {
                  const status = statusPorItem[item.name] || {};
                  return (
                    <li key={item.name}>
                      {item.name}: Quantidade de unidade(s): <b>{item.value}</b>
                      {' | '}
                      <span style={{ background: getStatusColor('pendente'), padding: '2px 6px', borderRadius: 4 }}>
                        Pendente: <b>{status.pendente || 0}</b>
                      </span>
                      {' | '}
                      <span style={{ background: getStatusColor('concluido'), padding: '2px 6px', borderRadius: 4 }}>
                        Concluído: <b>{status.concluido || 0}</b>
                      </span>
                      {' | '}
                      <span style={{ background: getStatusColor('não pago'), color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
                        Não pago: <b>{status['não pago'] || 0}</b>
                      </span>
                      {' | '}
                      <span style={{ background: getStatusColor('cancelado'), color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
                        Cancelado: <b>{status.cancelado || 0}</b>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            {/* Top 5 lojas por contagem */}
            <div style={{ fontSize: 15, marginTop: 16 }}>
              <b>Top 5 Nome da loja (Contagem):</b>
              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                {top5Lojas.map((loja, idx) => (
                  <li key={loja.name}>
                    {loja.name}: <b>{loja.value}</b> pedidos
                  </li>
                ))}
              </ol>
            </div>
            {/* Top 5 itens por valor de compra */}
            <div style={{ fontSize: 15, marginTop: 16 }}>
              <b>Top 5 Nome do Item x Valor de Compra(R$) (Soma):</b>
              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                {top5ItensValorCompra.map((item, idx) => (
                  <li key={item.name}>
                    {item.name}: <b>{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>
                  </li>
                ))}
              </ol>
            </div>
            {/* Horário do pedido com mais vendas */}
            <div style={{ fontSize: 15, marginTop: 16 }}>
              <b>Horário do pedido com mais vendas:</b>{' '}
              {horarioMaisVendeu ? (
                <>
                  {excelDateToJSDate(Number(horarioMaisVendeu.name))}
                  {produtoMaisVendeu ? ` - ${produtoMaisVendeu}` : ''}
                  {precoUnitarioMaisVendeu > 0 ? (
                    <>
                      : <b>{horarioMaisVendeu.value}</b> unidades
                      {' | '}Preço unitário: <b>{precoUnitarioMaisVendeu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                      {' | '}Total: <b>{totalMaisVendeu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                      {' | '}Comissão total: <b>{comissaoTotalMaisVendeu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                    </>
                  ) : (
                    <>: <b>{horarioMaisVendeu.value}</b> unidades</>
                  )}
                </>
              ) : (
                'Não disponível'
              )}
            </div>
            {/* Maior comissão líquida do afiliado e produto correspondente */}
            <div style={{ fontSize: 15, marginTop: 8 }}>
              <b>Maior Comissão líquida do afiliado(R$):</b>{' '}
              {maiorComissao > 0
                ? <span style={{ color: '#388e3c', fontWeight: 'bold' }}>
                    {maiorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - {produtoMaiorComissao}
                  </span>
                : 'Não disponível'}
            </div>
          </div>
          {/* Gráficos */}
          <div style={{ marginTop: 32 }}>
            <h3>Gráficos de Barras</h3>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              {menorData && maiorData && (
                <span>
                  <b>Período:</b> {menorData} até {maiorData}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              {/* Gráfico de Status do Pedido */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Status do Pedido (Contagem)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Nome da Loja */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Nome da loja (Contagem)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosLoja}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#388e3c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Nome do Item x Preço(R$) */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Nome do Item x Preço(R$) (Soma)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosPreco}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#d32f2f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Nome do Item x Qtd */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Nome do Item x Qtd (Soma)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosQtd}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Nome do Item x Valor de Compra(R$) */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Nome do Item x Valor de Compra(R$) (Soma)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosCompra}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#fbc02d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Nome do Item x Valor do Reembolso(R$) */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Nome do Item x Valor do Reembolso(R$) (Soma)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosReembolso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#7b1fa2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Nome do Item x Comissão líquida do afiliado(R$) */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Nome do Item x Comissão líquida do afiliado(R$) (Soma)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosComissao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Horário do pedido x Quantidade vendida */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Horário do pedido x Quantidade vendida</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={excelDataOrdenado.map(item => ({
                    ...item,
                    name: excelDateToJSDate(Number(item[idxHorario]))
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#00bcd4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gráfico de Canal (Contagem) */}
              <div style={{ flex: 1, minWidth: 350 }}>
                <b>Canal (Contagem)</b>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosCanal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0097a7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Tabela de Dados Brutos */}
          <div style={{ marginTop: 32, overflowX: 'auto' }}>
            <table style={{ background: '#fff', borderRadius: 8, width: '100%', minWidth: 1000 }}>
              <thead>
                <tr>
                  {excelHeaders.map((h, i) => (
                    <th key={i} style={{ fontSize: 13, padding: 4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelDataOrdenado.map((row, i) => {
                  const status = row[idxStatus];
                  const bgColor = getRowBackgroundColor(status);
                  return (
                    <tr key={i} style={bgColor ? { background: bgColor } : {}}>
                      {row.map((cell, j) => {
                        // Aplica estilo especial para a maior comissão
                        if (excelHeaders[j] === 'Comissão líquida do afiliado(R$)' && Number(cell) === maiorComissao && maiorComissao > 0) {
                          return (
                            <td
                              key={j}
                              style={{
                                fontSize: 13,
                                padding: 4,
                                textAlign: 'center',
                                background: '#92fcaf',
                                fontWeight: 'bold',
                                color: '#1b5e20'
                              }}
                            >
                              {cell}
                            </td>
                          );
                        }
                        // Formata a data do Excel para o formato de data JavaScript
                        if (excelHeaders[j] === 'Horário do pedido') {
                          return (
                            <td key={j} style={{ fontSize: 13, padding: 4, textAlign: 'center' }}>
                              {excelDateToJSDate(Number(cell))}
                            </td>
                          );
                        }
                        return (
                          <td key={j} style={{ fontSize: 13, padding: 4, textAlign: 'center' }}>
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}