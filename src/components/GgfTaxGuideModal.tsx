import React from 'react';
import { X, BookOpen, Calculator, CheckCircle2, AlertTriangle, HelpCircle, Layers, Zap } from 'lucide-react';

interface GgfTaxGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GgfTaxGuideModal: React.FC<GgfTaxGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Guia Prático: GGF, Tributos e Formação de Preço Correta
              </h2>
              <p className="text-xs text-slate-500">
                Conceitos de controladoria para não perder dinheiro na precificação
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: O que é GGF */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-2">
            <h3 className="font-bold text-sm text-purple-950 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-700" />
              1. O que são Gastos Gerais de Fabricação (GGF)?
            </h3>
            <p>
              O <b>GGF (ou Custos Indiretos de Fabricação - CIF)</b> engloba todos os custos necessários para manter a produção funcionando, mas que não podem ser atribuídos diretamente com uma régua ou balança a um único produto.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-purple-200/60">
              <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                <b className="text-purple-900 block mb-1">Energia & Utilidades</b>
                <span>Eletricidade dos maquinários, gás dos fornos industriais, água da fábrica.</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                <b className="text-purple-900 block mb-1">Espaço & Instalações</b>
                <span>Aluguel do galpão ou ateliê rateado pelo volume mensal produzido.</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                <b className="text-purple-900 block mb-1">Manutenção & Depreciação</b>
                <span>Desgaste de ferramentas, afiação de lâminas, conserto preventivo de tornos/batedeiras.</span>
              </div>
            </div>
          </div>

          {/* Section 2: O Perigo do Markup Multiplicador vs Markup Divisor */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
            <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. O Erro Mais Comum: "Somar Porcentagens" em Cima do Custo
            </h3>
            <p>
              Muitos empresários calculam assim: se o custo é R$ 100, os impostos são 10% e o lucro desejado é 20%, somam 30% e vendem por R$ 130. <b>Isso está matematicamente errado e causa prejuízo!</b>
            </p>
            <p className="bg-white p-3 rounded-xl border border-amber-200 font-mono text-[11px] text-amber-950">
              Se você vender por <b>R$ 130,00</b>:
              <br />• 10% de imposto sobre R$ 130 = R$ 13,00
              <br />• Custo do produto = R$ 100,00
              <br />• Sobra no bolso: R$ 17,00 (apenas <b>13,07%</b> de margem real, e NÃO os 20% que você queria!).
            </p>
            <p className="font-semibold text-slate-800">
              Nossa ferramenta utiliza a fórmula oficial contábil do <b>Markup Divisor (Margem por Dentro)</b>:
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-mono text-center font-bold">
              Preço de Venda = Custo Total / [1 - (Impostos% + Comissões% + Margem Desejada%)]
            </div>
          </div>

          {/* Section 3: Impostos Brasileiros */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-700" />
              3. Principais Regimes Tributários
            </h3>
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-900 min-w-[130px]">• Lucro Real:</span>
                <span>
                  Regime Não-Cumulativo onde <b>PIS (1,65%)</b> e <b>COFINS (7,60%)</b> incidem sobre o faturamento, mas você <b>recupera créditos fiscais (9,25% + ICMS)</b> sobre as compras de matérias-primas e energia elétrica industrial. Além disso, o <b>IRPJ e CSLL (34%)</b> incidem apenas sobre o lucro contábil apurado (LAIR), e não sobre a receita bruta.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px]">• Lucro Presumido:</span>
                <span>Impostos federais cumulativos (PIS 0.65%, COFINS 3%, IRPJ/CSLL presumidos) + ICMS estadual ou ISS municipal sem aproveitamento de créditos na entrada.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px]">• Simples Nacional:</span>
                <span>Alíquota única consolidada na guia DAS (varia de ~4% para comércio inicial a ~7.8% para indústrias/confecções).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px]">• MEI:</span>
                <span>Valor fixo mensal na guia DAS-MEI (alíquota efetiva por venda praticamente zero até o teto anual).</span>
              </div>
            </div>
          </div>

          {/* Section 4: Ponto de Equilíbrio */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
            <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              4. O que é o Ponto de Equilíbrio (Break-Even)?
            </h3>
            <p>
              É a quantidade exata de produtos que você precisa vender no mês para que a <b>Margem de Contribuição</b> pague todas as despesas fixas da empresa. A partir da próxima unidade vendida, 100% da margem vira lucro líquido!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Entendido, Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
