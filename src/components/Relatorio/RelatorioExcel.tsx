import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Função para formatar a coluna Data do Excel (converte número Excel para data legível)
function formatarDataExcel(valor: any) {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const dias = Math.floor(valor);
    const ms = dias * 24 * 60 * 60 * 1000;
    const data = new Date(excelEpoch.getTime() + ms);
    const decimal = valor - dias;
    if (decimal > 0) {
      data.setSeconds(data.getSeconds() + Math.round(decimal * 24 * 60 * 60));
    }
    return data.toLocaleDateString('pt-BR');
  }
  return valor;
}

function toDateObj(valor: any): Date | null {
  if (typeof valor === 'string') {
    const [dia, mes, ano] = valor.split('/');
    if (dia && mes && ano) {
      return new Date(Number(ano), Number(mes) - 1, Number(dia));
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      return new Date(valor);
    }
    return null;
  }
  if (typeof valor === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const dias = Math.floor(valor);
    const ms = dias * 24 * 60 * 60 * 1000;
    const data = new Date(excelEpoch.getTime() + ms);
    const decimal = valor - dias;
    if (decimal > 0) {
      data.setSeconds(data.getSeconds() + Math.round(decimal * 24 * 60 * 60));
    }
    return data;
  }
  return null;
}

export default function RelatorioExcel() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelMessage, setExcelMessage] = useState('');
  const [excelFileName, setExcelFileName] = useState('');

  const chartOptions = (titulo: string, cor: string) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: titulo,
        font: { size: 22, family: 'monospace' },
        color: '#1976d2',
        padding: { bottom: 20 }
      }
    },
    scales: {
      x: { ticks: { color: '#1976d2', font: { family: 'monospace' } } },
      y: { ticks: { color: '#1976d2', font: { family: 'monospace' } } }
    }
  });

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonData.length > 1) {
        setExcelHeaders(jsonData[0] as string[]);
        setExcelData(jsonData.slice(1));
        setExcelMessage('Arquivo importado com sucesso!');
      } else {
        setExcelHeaders([]);
        setExcelData([]);
        setExcelMessage('Arquivo vazio ou formato inválido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Ordenar excelData pelo menor dia (coluna 0)
  const sortedExcelData = [...excelData].sort((a, b) => {
    const dateA = toDateObj(a[0]);
    const dateB = toDateObj(b[0]);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  const excelLabels = sortedExcelData.map(row => formatarDataExcel(row[0]));
  const getCol = (header: string) => {
    const idx = excelHeaders.findIndex(h => h?.toLowerCase().includes(header.toLowerCase()));
    return sortedExcelData.map(row => Number(row[idx]) || 0);
  };

  const getSum = (header: string) => {
    const idx = excelHeaders.findIndex(h => h?.toLowerCase().includes(header.toLowerCase()));
    if (idx === -1) return 0;
    return sortedExcelData.reduce((acc, row) => acc + (Number(row[idx]) || 0), 0);
  };

  const excelCharts = excelHeaders.length > 0 && sortedExcelData.length > 0 && (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ color: '#1976d2', fontFamily: 'monospace' }}>Gráficos do Excel Importado</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        <div style={{ width: 400 }}>
          <Bar
            data={{
              labels: excelLabels,
              datasets: [{ label: 'Cliques', data: getCol('Cliques'), backgroundColor: '#e57373' }]
            }}
            options={chartOptions('Cliques', '#e57373')}
          />
        </div>
        <div style={{ width: 400 }}>
          <Bar
            data={{
              labels: excelLabels,
              datasets: [{ label: 'Pedidos', data: getCol('Pedidos'), backgroundColor: '#ffb74d' }]
            }}
            options={chartOptions('Pedidos', '#ffb74d')}
          />
        </div>
        <div style={{ width: 400 }}>
          <Bar
            data={{
              labels: excelLabels,
              datasets: [{ label: 'Comissão est. (R$)', data: getCol('Comissão'), backgroundColor: '#a1887f' }]
            }}
            options={chartOptions('Comissão est. (R$)', '#a1887f')}
          />
        </div>
        <div style={{ width: 400 }}>
          <Bar
            data={{
              labels: excelLabels,
              datasets: [{ label: 'Itens vendidos', data: getCol('Itens vendidos'), backgroundColor: '#388e3c' }]
            }}
            options={chartOptions('Itens vendidos', '#388e3c')}
          />
        </div>
        <div style={{ width: 400 }}>
          <Bar
            data={{
              labels: excelLabels,
              datasets: [{ label: 'Valor do pedido (R$)', data: getCol('Valor do pedido'), backgroundColor: '#ffe082' }]
            }}
            options={chartOptions('Valor do pedido (R$)', '#ffe082')}
          />
        </div>
        <div style={{ width: 400 }}>
          <Bar
            data={{
              labels: excelLabels,
              datasets: [{ label: 'Novos compradores', data: getCol('Novos compradores'), backgroundColor: '#7b1fa2' }]
            }}
            options={chartOptions('Novos compradores', '#7b1fa2')}
          />
        </div>
      </div>
      {/* Tabela dos dados importados */}
      <div style={{ marginTop: 32, overflowX: 'auto' }}>
        <table style={{ background: '#fff', borderRadius: 8, width: '100%', minWidth: 800 }}>
          <thead>
            <tr>
              {excelHeaders.map((h, i) => (
                <th key={i} style={{ fontSize: 13, padding: 4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedExcelData.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ fontSize: 13, padding: 4, textAlign: 'center' }}>
                    {j === 0 ? formatarDataExcel(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Somas abaixo da tabela */}
        <div style={{ marginTop: 16, background: '#f7f7f7', borderRadius: 8, padding: 16, width: 'fit-content' }}>
          <b>Soma dos campos:</b>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: 'monospace', fontSize: 15 }}>
            <li><b>Cliques:</b> {getSum('Cliques')}</li>
            <li><b>Pedidos:</b> {getSum('Pedidos')}</li>
            <li><b>Comissão est.(R$):</b> {getSum('Comissão')}</li>
            <li><b>Itens vendidos:</b> {getSum('Itens vendidos')}</li>
            <li><b>Valor do pedido(R$):</b> {getSum('Valor do pedido')}</li>
            <li><b>Novos compradores:</b> {getSum('Novos compradores')}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 48, background: '#e3f2fd', borderRadius: 12, padding: 24 }}>
      <h2 style={{ color: '#1976d2', fontFamily: 'monospace' }}>Importar Excel de Indicadores AffiliateDashboardReport</h2>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelUpload}
        style={{ marginBottom: 16 }}
      />
      {excelFileName && <div style={{ marginBottom: 8 }}>Arquivo: <b>{excelFileName}</b></div>}
      {excelMessage && <div style={{ marginBottom: 16, color: '#388e3c' }}>{excelMessage}</div>}
      {excelCharts}
    </div>
  );
}