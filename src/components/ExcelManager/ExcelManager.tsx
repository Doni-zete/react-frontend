import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import './excelmanager.css';

export default function ExcelManager() {
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Importar planilha
  const handleFileUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(jsonData as any[][]);
      setMessage('Planilha importada com sucesso!');
    };
    reader.readAsArrayBuffer(file);
  };

  // Atualizar célula localmente
  const handleCellChange = (row: number, col: number, value: string) => {
    setExcelData(prev => {
      const copy = prev.map(r => [...r]);
      copy[row][col] = value;
      return copy;
    });
  };

  // Exportar planilha
  const handleDownload = () => {
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'planilha_editada.xlsx');
    setMessage('Download iniciado!');
  };

  return (
    <div className="excel-manager-container">
      <h2>Importar/Exportar Planilha Excel</h2>
      <form onSubmit={handleFileUpload} className="excel-form">
        <input type="file" accept=".xlsx,.xls" ref={fileInputRef} required />
        <button type="submit">Importar</button>
      </form>
      <button onClick={handleDownload} disabled={!excelData.length} className="excel-btn">
        Exportar Planilha
      </button>
      {message && <div className="excel-message">{message}</div>}
      <div className="excel-table-container">
        {excelData.length > 0 && (
          <table className="excel-table">
            <thead>
              <tr>
                {excelData[0].map((cell: any, colIndex: number) => (
                  <th key={colIndex}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell: any, colIndex: number) => (
                    <td key={colIndex}>
                      <input
                        value={cell ?? ''}
                        onChange={e => handleCellChange(rowIndex + 1, colIndex, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}