import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Calculator, Loader2 } from 'lucide-react';
import { MarginInputs, SEGMENTOS } from './types';

interface Props {
  onSubmit: (inputs: MarginInputs) => void;
  isLoading?: boolean;
}

const TOOLTIPS = {
  quantidadeVendida: 'Quantidade total de produtos vendidos no mês. Ex: Se você vendeu 50 equipamentos, coloque 50.',
  precoMedioUnitario: 'Preço médio de venda de cada unidade. Ex: Se vende por R$ 5.000 cada, coloque 5000.',
  materiaPrima: 'Custo mensal com materiais brutos (aço, ferro, tecidos, espumas). Ex: R$ 80.000/mês.',
  componentes: 'Custo com peças compradas prontas (motores, polias, cabos, eletrônicos). Ex: R$ 40.000/mês.',
  maoDeObra: 'Salários + encargos da equipe de produção direta (operadores, soldadores). Ex: R$ 35.000/mês.',
  energia: 'Custo de energia elétrica da fábrica. Ex: R$ 8.000/mês.',
  impostos: 'Impostos sobre vendas (ICMS, PIS, COFINS). Geralmente 15-25% do faturamento.',
  comissao: 'Comissão paga a vendedores ou representantes. Ex: 5-10% do faturamento.',
  frete: 'Custo de frete para entregar os produtos vendidos. Ex: R$ 15.000/mês.',
  administrativo: 'Custos fixos administrativos (contabilidade, RH, escritório). Ex: R$ 20.000/mês.',
  comercial: 'Custos fixos da área comercial (salários fixos, CRM, viagens). Ex: R$ 15.000/mês.',
  marketing: 'Investimento mensal em marketing e publicidade. Ex: R$ 10.000/mês.',
  engenharia: 'Custos com engenharia, P&D e desenvolvimento de produtos. Ex: R$ 12.000/mês.',
};

function InputWithTooltip({ 
  id, 
  label, 
  tooltip, 
  value, 
  onChange,
  prefix = 'R$'
}: { 
  id: string; 
  label: string; 
  tooltip: string; 
  value: number; 
  onChange: (value: number) => void;
  prefix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
              <Info size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-sm">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {prefix}
        </span>
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="pl-10 h-12 text-base"
          placeholder="0"
          data-testid={`input-margin-${id}`}
        />
      </div>
    </div>
  );
}

export function MarginCalculatorForm({ onSubmit, isLoading }: Props) {
  const [inputs, setInputs] = useState<MarginInputs>({
    segmento: 'musculacao',
    quantidadeVendida: 0,
    precoMedioUnitario: 0,
    materiaPrima: 0,
    componentes: 0,
    maoDeObra: 0,
    energia: 0,
    impostos: 0,
    comissao: 0,
    frete: 0,
    administrativo: 0,
    comercial: 0,
    marketing: 0,
    engenharia: 0,
  });

  const updateField = (field: keyof MarginInputs) => (value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  const isValid = inputs.quantidadeVendida > 0 && inputs.precoMedioUnitario > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">1</span>
          </div>
          Seu Segmento
        </h3>
        <Select value={inputs.segmento} onValueChange={(v) => updateField('segmento')(v)}>
          <SelectTrigger className="h-12 text-base" data-testid="select-segmento">
            <SelectValue placeholder="Selecione o segmento" />
          </SelectTrigger>
          <SelectContent>
            {SEGMENTOS.map(seg => (
              <SelectItem key={seg.value} value={seg.value}>{seg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">2</span>
          </div>
          Vendas do Mês
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithTooltip
            id="quantidadeVendida"
            label="Quantidade Vendida"
            tooltip={TOOLTIPS.quantidadeVendida}
            value={inputs.quantidadeVendida}
            onChange={updateField('quantidadeVendida')}
            prefix="Qtd"
          />
          <InputWithTooltip
            id="precoMedioUnitario"
            label="Preço Médio Unitário"
            tooltip={TOOLTIPS.precoMedioUnitario}
            value={inputs.precoMedioUnitario}
            onChange={updateField('precoMedioUnitario')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">3</span>
          </div>
          Custos de Produção (CMV)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithTooltip id="materiaPrima" label="Matéria-Prima" tooltip={TOOLTIPS.materiaPrima} value={inputs.materiaPrima} onChange={updateField('materiaPrima')} />
          <InputWithTooltip id="componentes" label="Componentes Comprados" tooltip={TOOLTIPS.componentes} value={inputs.componentes} onChange={updateField('componentes')} />
          <InputWithTooltip id="maoDeObra" label="Mão de Obra Direta" tooltip={TOOLTIPS.maoDeObra} value={inputs.maoDeObra} onChange={updateField('maoDeObra')} />
          <InputWithTooltip id="energia" label="Energia / Fábrica" tooltip={TOOLTIPS.energia} value={inputs.energia} onChange={updateField('energia')} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-700 font-bold text-sm">4</span>
          </div>
          Custos Variáveis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputWithTooltip id="impostos" label="Impostos s/ Venda" tooltip={TOOLTIPS.impostos} value={inputs.impostos} onChange={updateField('impostos')} />
          <InputWithTooltip id="comissao" label="Comissão" tooltip={TOOLTIPS.comissao} value={inputs.comissao} onChange={updateField('comissao')} />
          <InputWithTooltip id="frete" label="Frete" tooltip={TOOLTIPS.frete} value={inputs.frete} onChange={updateField('frete')} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-bold text-sm">5</span>
          </div>
          Custos Fixos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithTooltip id="administrativo" label="Administrativo" tooltip={TOOLTIPS.administrativo} value={inputs.administrativo} onChange={updateField('administrativo')} />
          <InputWithTooltip id="comercial" label="Comercial" tooltip={TOOLTIPS.comercial} value={inputs.comercial} onChange={updateField('comercial')} />
          <InputWithTooltip id="marketing" label="Marketing" tooltip={TOOLTIPS.marketing} value={inputs.marketing} onChange={updateField('marketing')} />
          <InputWithTooltip id="engenharia" label="Engenharia / P&D" tooltip={TOOLTIPS.engenharia} value={inputs.engenharia} onChange={updateField('engenharia')} />
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-14 text-lg font-bold bg-accent hover:bg-orange-600 shadow-lg"
        disabled={!isValid || isLoading}
        data-testid="button-calcular-margem"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            <Calculator className="w-5 h-5 mr-2" />
            Calcular Diagnóstico
          </>
        )}
      </Button>
    </form>
  );
}
