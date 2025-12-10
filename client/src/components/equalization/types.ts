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
  { id: "1", descricao: "Parafuso Sextavado M6 x 20mm", quantidade: 1000, unidade: "un" },
  { id: "2", descricao: "Porca Sextavada M6 Zincada", quantidade: 1000, unidade: "un" },
  { id: "3", descricao: "Arruela Lisa M6 Zincada", quantidade: 2000, unidade: "un" },
  { id: "4", descricao: "Chave de Fenda Cruzada 1/4 x 6", quantidade: 20, unidade: "un" },
  { id: "5", descricao: "Luva de Proteção Pigmentada", quantidade: 50, unidade: "par" },
];

// Helper to generate mock response based on file upload
export const generateMockFornecedor = (fileName: string, index: number): Fornecedor => {
  const basePrices = [0.45, 0.25, 0.10, 15.90, 4.50];
  
  // Strategy to ensure significant savings (> R$ 200):
  // We create one supplier that is generally cheap but expensive on specific items,
  // and others that are expensive generally but cheap on those specific items.
  // This forces the "Mix" to be much better than any single "Package".

  let variation: number;
  let itemVariations: number[];

  if (index === 0) {
    // Fornecedor 1: Average overall, but expensive on high volume items
    variation = 1.0; 
    itemVariations = [1.2, 1.2, 0.9, 0.9, 1.0]; 
  } else if (index === 1) {
    // Fornecedor 2: Good overall (usually best single), but expensive on tools/gloves
    variation = 0.95;
    itemVariations = [0.9, 0.9, 1.0, 1.3, 1.3];
  } else {
    // Fornecedor 3: Expensive overall, but very cheap on specific high volume items to break the mix
    variation = 1.1;
    itemVariations = [0.8, 1.3, 1.2, 0.8, 0.8];
  }
  
  const precos: PrecoItem[] = MOCK_ITENS.map((item, i) => {
    // Add small random noise to make it look organic
    const noise = 0.98 + Math.random() * 0.04;
    const itemStrategy = itemVariations[i];
    
    const unitPrice = Number((basePrices[i] * variation * itemStrategy * noise).toFixed(2));
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
