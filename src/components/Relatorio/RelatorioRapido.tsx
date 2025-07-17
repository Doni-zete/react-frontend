import { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Registro dos elementos necessários do Chart.js
Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function RelatorioRapido() {
  const [rapido, setRapido] = useState({
    cliques: '',
    pedidos: '',
    comissao: '',
    itensVendidos: '',
    valorPedido: '',
  });

  const handleRapidoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRapido({ ...rapido, [e.target.name]: e.target.value });
  };

  const labelsRapido = [
    'Cliques',
    'Pedidos',
    'Comissão Est. (R$)',
    'Itens Vendidos',
    'Valor do Pedido',
  ];
  const dataRapido = [
    Number(rapido.cliques) || 0,
    Number(rapido.pedidos) || 0,
    Number(rapido.comissao) || 0,
    Number(rapido.itensVendidos) || 0,
    Number(rapido.valorPedido) || 0,
  ];

  const pieData = {
    labels: labelsRapido,
    datasets: [
      {
        data: dataRapido,
        backgroundColor: [
          '#1976d2',
          '#388e3c',
          '#fbc02d',
          '#d32f2f',
          '#7b1fa2',
        ],
      },
    ],
  };

  const barData = {
    labels: labelsRapido,
    datasets: [
      {
        label: 'Valores',
        data: dataRapido,
        backgroundColor: '#1976d2',
      },
    ],
  };

  return (
    <div style={{ marginBottom: 48, background: '#fff3e0', borderRadius: 12, padding: 24 }}>
      <h2 style={{ color: '#c96', fontFamily: 'monospace' }}>Relatório Rápido</h2>
      <form style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <label>Clique</label>
          <input type="number" name="cliques" value={rapido.cliques} onChange={handleRapidoChange} />
        </div>
        <div>
          <label>Pedidos</label>
          <input type="number" name="pedidos" value={rapido.pedidos} onChange={handleRapidoChange} />
        </div>
        <div>
          <label>Comissão Est. (R$)</label>
          <input type="number" name="comissao" value={rapido.comissao} onChange={handleRapidoChange} />
        </div>
        <div>
          <label>Itens Vendidos</label>
          <input type="number" name="itensVendidos" value={rapido.itensVendidos} onChange={handleRapidoChange} />
        </div>
        <div>
          <label>Valor do Pedido</label>
          <input type="number" name="valorPedido" value={rapido.valorPedido} onChange={handleRapidoChange} />
        </div>
      </form>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ width: 320 }}>
          <h4>Gráfico de Pizza</h4>
          <Pie data={pieData} />
        </div>
        <div style={{ width: 400 }}>
          <h4>Gráfico de Barras</h4>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
}