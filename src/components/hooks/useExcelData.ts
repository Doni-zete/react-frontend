import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { somarPorChave, contarOcorrencias, getStatusCountByItem } from '../utils/dataProcessing';
import { excelDateToJSDate } from '../utils/excelUtils';

interface ColumnIndices {
  idxStatus: number;
  idxLoja: number;
  idxItem: number;
  idxPreco: number;
  idxQtd: number;
  idxCompra: number;
  idxReembolso: number;
  idxCanal: number;
  idxComissao: number;
  idxHorario: number;
}

export function useExcelData(COLUNAS_DESEJADAS: string[]) {
  // Estado para armazenar os dados do Excel
  const [excelData, setExcelData] = useState<any[]>([]);
  // Estado para armazenar os cabeçalhos das colunas do Excel
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  // Estado para mensagens de feedback ao usuário (sucesso/erro na importação)
  const [excelMessage, setExcelMessage] = useState('');
  // Estado para armazenar o nome do arquivo importado
  const [excelFileName, setExcelFileName] = useState('');

  /**
   * @method handleExcelUpload
   * @description Lida com o upload do arquivo Excel.
   * Lê o arquivo, extrai os dados e os armazena nos estados `excelData` e `excelHeaders`.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de mudança do input de arquivo.
   */
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
        const headers = jsonData[0] as string[];
        // Mapeia as colunas desejadas para seus respectivos índices no arquivo Excel
        const indices = COLUNAS_DESEJADAS.map(col =>
          headers.findIndex(h => h?.toLowerCase().trim() === col.toLowerCase().trim())
        );
        // Filtra os dados, pegando apenas as colunas desejadas e ignorando a linha do cabeçalho
        const filteredData = jsonData.slice(1).map((row: any[]) =>
          indices.map(idx => row[idx])
        );
        setExcelHeaders(COLUNAS_DESEJADAS);
        setExcelData(filteredData);
        setExcelMessage('Arquivo importado com sucesso!');
      } else {
        setExcelHeaders([]);
        setExcelData([]);
        setExcelMessage('Arquivo vazio ou formato inválido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Memoiza os índices das colunas para evitar recálculos desnecessários
  const indices: ColumnIndices = useMemo(() => ({
    idxStatus: excelHeaders.indexOf('Status do Pedido'),
    idxLoja: excelHeaders.indexOf('Nome da loja'),
    idxItem: excelHeaders.indexOf('Nome do Item'),
    idxPreco: excelHeaders.indexOf('Preço(R$)'),
    idxQtd: excelHeaders.indexOf('Qtd'),
    idxCompra: excelHeaders.indexOf('Valor de Compra(R$)'),
    idxReembolso: excelHeaders.indexOf('Valor do Reembolso(R$)'),
    idxCanal: excelHeaders.indexOf('Canal'),
    idxComissao: excelHeaders.indexOf('Comissão líquida do afiliado(R$)'),
    idxHorario: excelHeaders.indexOf('Horário do pedido'),
  }), [excelHeaders]);

  const { idxStatus, idxLoja, idxItem, idxPreco, idxQtd, idxCompra, idxReembolso, idxCanal, idxComissao, idxHorario } = indices;

  // Memoiza os dados processados para gráficos e relatórios
  const dadosPreco = useMemo(() => idxItem >= 0 && idxPreco >= 0 ? somarPorChave(excelData, idxItem, idxPreco) : [], [excelData, idxItem, idxPreco]);
  const dadosQtd = useMemo(() => idxItem >= 0 && idxQtd >= 0 ? somarPorChave(excelData, idxItem, idxQtd) : [], [excelData, idxItem, idxQtd]);
  const dadosCompra = useMemo(() => idxItem >= 0 && idxCompra >= 0 ? somarPorChave(excelData, idxItem, idxCompra) : [], [excelData, idxItem, idxCompra]);
  const dadosReembolso = useMemo(() => idxItem >= 0 && idxReembolso >= 0 ? somarPorChave(excelData, idxItem, idxReembolso) : [], [excelData, idxItem, idxReembolso]);
  const dadosComissao = useMemo(() => idxItem >= 0 && idxComissao >= 0 ? somarPorChave(excelData, idxItem, idxComissao) : [], [excelData, idxItem, idxComissao]);

  const dadosStatus = useMemo(() => idxStatus >= 0 ? contarOcorrencias(excelData, idxStatus) : [], [excelData, idxStatus]);
  const dadosLoja = useMemo(() => idxLoja >= 0 ? contarOcorrencias(excelData, idxLoja) : [], [excelData, idxLoja]);
  const dadosCanal = useMemo(() => idxCanal >= 0 ? contarOcorrencias(excelData, idxCanal) : [], [excelData, idxCanal]);

  // Somas gerais dos campos
  const somaPreco = useMemo(() => idxPreco >= 0 ? excelData.reduce((acc, row) => acc + (Number(row[idxPreco]) || 0), 0) : 0, [excelData, idxPreco]);
  const somaCompra = useMemo(() => idxCompra >= 0 ? excelData.reduce((acc, row) => acc + (Number(row[idxCompra]) || 0), 0) : 0, [excelData, idxCompra]);
  const somaReembolso = useMemo(() => idxReembolso >= 0 ? excelData.reduce((acc, row) => acc + (Number(row[idxReembolso]) || 0), 0) : 0, [excelData, idxReembolso]);

  // Soma de comissão líquida por status
  const somaComissaoPendente = useMemo(() =>
    idxStatus >= 0 && idxComissao >= 0
      ? excelData.reduce((acc, row) => {
          const status = (row[idxStatus] || '').toString().toLowerCase();
          return status.includes('pendente') ? acc + (Number(row[idxComissao]) || 0) : acc;
        }, 0)
      : 0
  , [excelData, idxStatus, idxComissao]);

  const somaComissaoConcluido = useMemo(() =>
    idxStatus >= 0 && idxComissao >= 0
      ? excelData.reduce((acc, row) => {
          const status = (row[idxStatus] || '').toString().toLowerCase();
          return (status.includes('concluido') || status.includes('concluído')) ? acc + (Number(row[idxComissao]) || 0) : acc;
        }, 0)
      : 0
  , [excelData, idxStatus, idxComissao]);

  // Top 5 Itens Mais Vendidos (por Qtd)
  const top5Itens = useMemo(() => [...dadosQtd].sort((a, b) => b.value - a.value).slice(0, 10), [dadosQtd]);

  // Top 5 Lojas
  const top5Lojas = useMemo(() => [...dadosLoja].sort((a, b) => b.value - a.value).slice(0, 5), [dadosLoja]);

  // Top 5 Itens por Valor de Compra
  const top5ItensValorCompra = useMemo(() => [...dadosCompra].sort((a, b) => b.value - a.value).slice(0, 5), [dadosCompra]);

  // Horário do pedido com mais vendas
  const { horarioMaisVendeu, produtoMaisVendeu, precoUnitarioMaisVendeu, totalMaisVendeu, comissaoTotalMaisVendeu } = useMemo(() => {
    let hmv: { name: string, value: number } | null = null;
    let npm = '';
    let pum = 0;
    let tm = 0;
    let ctm = 0;

    const dadosHorarioQtd = idxHorario >= 0 && idxQtd >= 0
      ? somarPorChave(excelData, idxHorario, idxQtd)
      : [];
    const dadosHorarioQtdOrdenado = [...dadosHorarioQtd].sort((a, b) => Number(a.name) - Number(b.name));

    if (dadosHorarioQtd.length > 0 && idxHorario >= 0 && idxQtd >= 0 && idxItem >= 0 && idxPreco >= 0 && idxComissao >= 0) {
      const maxHorario = dadosHorarioQtd.reduce((max, curr) => curr.value > max.value ? curr : max, dadosHorarioQtd[0]);
      hmv = maxHorario;
      let maiorQtd = 0;
      let nomeProduto = '';
      let precoUnitario = 0;
      let total = 0;
      let comissaoTotal = 0;

      excelData.forEach(row => {
        if (String(row[idxHorario]) === String(maxHorario.name)) {
          const qtd = Number(row[idxQtd]) || 0;
          const comissao = Number(row[idxComissao]) || 0;
          if (qtd > maiorQtd) {
            maiorQtd = qtd;
            nomeProduto = row[idxItem];
            precoUnitario = Number(row[idxPreco]) || 0;
            total = precoUnitario * qtd;
          }
          comissaoTotal += comissao;
        }
      });
      npm = nomeProduto;
      pum = precoUnitario;
      tm = total;
      ctm = comissaoTotal;
    }
    return { horarioMaisVendeu: hmv, produtoMaisVendeu: npm, precoUnitarioMaisVendeu: pum, totalMaisVendeu: tm, comissaoTotalMaisVendeu: ctm, dadosHorarioQtdOrdenado };
  }, [excelData, idxHorario, idxQtd, idxItem, idxPreco, idxComissao]);

  // Maior comissão líquida do afiliado
  const { maiorComissao, produtoMaiorComissao } = useMemo(() => {
    let maiorComissao = 0;
    let produtoMaiorComissao = '';
    if (idxComissao >= 0 && idxItem >= 0) {
      excelData.forEach(row => {
        const comissao = Number(row[idxComissao]) || 0;
        if (comissao > maiorComissao) {
          maiorComissao = comissao;
          produtoMaiorComissao = row[idxItem];
        }
      });
    }
    return { maiorComissao, produtoMaiorComissao };
  }, [excelData, idxComissao, idxItem]);

  // Período (menor e maior data)
  const { menorData, maiorData } = useMemo(() => {
    let menor = '';
    let maior = '';
    const dadosHorarioQtd = idxHorario >= 0 && idxQtd >= 0
      ? somarPorChave(excelData, idxHorario, idxQtd)
      : [];
    const dadosHorarioQtdOrdenado = [...dadosHorarioQtd].sort((a, b) => Number(a.name) - Number(b.name));

    if (dadosHorarioQtdOrdenado.length > 0) {
      menor = excelDateToJSDate(Number(dadosHorarioQtdOrdenado[0].name));
      maior = excelDateToJSDate(Number(dadosHorarioQtdOrdenado[dadosHorarioQtdOrdenado.length - 1].name));
    }
    return { menorData: menor, maiorData: maior };
  }, [excelData, idxHorario, idxQtd]);

  // Dados do Excel ordenados por horário
  const excelDataOrdenado = useMemo(() => {
    const sortedData = [...excelData];
    if (idxHorario >= 0) {
      sortedData.sort((a, b) => {
        const aNum = Number(a[idxHorario]);
        const bNum = Number(b[idxHorario]);
        if (isNaN(aNum) && isNaN(bNum)) return 0;
        if (isNaN(aNum)) return 1;
        if (isNaN(bNum)) return -1;
        return aNum - bNum;
      });
    }
    return sortedData;
  }, [excelData, idxHorario]);

  return {
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
    excelDataOrdenado,
  };
}