export interface Item {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
}

export interface PrecoItem {
  itemId: string;
  precoUnitario: number;
  precoTotal: number;
}

export interface Fornecedor {
  id: string;
  nome: string;
  precos: PrecoItem[]; // Maps itemId to price
  total: number;
  subtotal: number;
  impostos: number;
  fileName: string;
}

export interface LeadData {
  email: string;
  empresa: string;
}

export const MOCK_ITENS: Item[] = [
  { id: "1", descricao: "Parafuso Sextavado M6 x 20mm", quantidade: 100, unidade: "un" },
  { id: "2", descricao: "Porca Sextavada M6 Zincada", quantidade: 100, unidade: "un" },
  { id: "3", descricao: "Arruela Lisa M6 Zincada", quantidade: 200, unidade: "un" },
  { id: "4", descricao: "Chave de Fenda Cruzada 1/4 x 6", quantidade: 5, unidade: "un" },
  { id: "5", descricao: "Luva de Proteção Pigmentada", quantidade: 20, unidade: "par" },
];

// Helper to generate mock response based on file upload
export const generateMockFornecedor = (fileName: string, index: number): Fornecedor => {
  const basePrices = [0.45, 0.25, 0.10, 15.90, 4.50];
  const variation = 0.85 + Math.random() * 0.3; // Random price variation between -15% and +15%
  
  // Specific mock logic to ensure "Fornecedor 2" is usually best for some items as per requirements example
  // But let's make it random enough to be interesting
  
  const precos: PrecoItem[] = MOCK_ITENS.map((item, i) => {
    // Add some noise to individual item prices
    const itemVariation = 0.9 + Math.random() * 0.2;
    const unitPrice = Number((basePrices[i] * variation * itemVariation).toFixed(2));
    return {
      itemId: item.id,
      precoUnitario: unitPrice,
      precoTotal: Number((unitPrice * item.quantidade).toFixed(2))
    };
  });

  const subtotal = precos.reduce((acc, curr) => acc + curr.precoTotal, 0);
  const impostos = Number((subtotal * 0.1).toFixed(2)); // 10% tax mock

  return {
    id: `forn-${index}`,
    nome: index === 0 ? "ABC Comercial Ltda" : index === 1 ? "Fornecedor 2" : "XYZ Distribuidora",
    fileName,
    precos,
    subtotal,
    impostos,
    total: subtotal + impostos
  };
};

export const STORAGE_KEY = "zeno_demo_usage";
export const DAILY_LIMIT = 5;

export const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { 
    style: "currency", 
    currency: "BRL" 
  });
};
