import RelatorioRapido from './RelatorioRapido';
import RelatorioExcel from './RelatorioExcel';
import RelatorioItensExcel from '../RelatorioItensExcel/RelatorioItensExcel';

export default function Relatorio() {
  return (
    <div style={{ padding: 24, background: '#fff7ee' }}>
      <RelatorioRapido />
      <RelatorioExcel />
      <RelatorioItensExcel  />
    </div>
  );
}