
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calendar, 
  Users, 
  Briefcase, 
  DollarSign, 
  History as HistoryIcon, 
  Download,
  Search,
  Printer,
  Trash2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ExternalLink,
  Wand2,
  Plus,
  X
} from 'lucide-react';
import { AppDatabase, Screen, Order, OrderItem, Expense, Client, Service } from '../types';
import { parseWhatsAppText } from '../services/parser';
import { format, parse, isAfter, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

// --- Sidebar ---
export const Layout: React.FC<{ 
  children: React.ReactNode; 
  currentScreen: Screen; 
  onNavigate: (s: Screen) => void;
  onBackup: () => void;
}> = ({ children, currentScreen, onNavigate, onBackup }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Principal' },
    { id: 'new-order', label: 'Novo Pedido', icon: PlusCircle, group: 'Principal' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, group: 'Principal' },
    { id: 'clients', label: 'Clientes', icon: Users, group: 'Cadastros' },
    { id: 'services', label: 'Produtos', icon: Briefcase, group: 'Cadastros' },
    { id: 'financial', label: 'Financeiro', icon: DollarSign, group: 'Gestão' },
    { id: 'history', label: 'Histórico', icon: HistoryIcon, group: 'Gestão' },
  ];

  const grouped = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="flex w-full">
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-screen sticky top-0 no-print border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Antunes</h1>
            <span className="text-xs text-slate-400">Turismo & Gestão</span>
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-3 px-2 tracking-widest">{group}</h3>
              <div className="space-y-1">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as Screen)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      currentScreen === item.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onBackup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-white"
          >
            <Download size={16} />
            Backup Dados
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-100 min-h-screen no-print overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// --- Dashboard ---
export const Dashboard: React.FC<{ db: AppDatabase; onNewOrder: () => void; onPrint: (o: Order) => void }> = ({ db, onNewOrder, onPrint }) => {
  const stats = useMemo(() => {
    const totalSale = db.orders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + (item.saleValue * item.quantity), 0) - o.discount, 0);
    const totalCost = db.orders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + (item.costValue * item.quantity), 0), 0);
    const totalExpenses = db.expenses.reduce((acc, e) => acc + e.amount, 0);
    return {
      gross: totalSale,
      cost: totalCost,
      net: totalSale - totalCost - totalExpenses
    };
  }, [db]);

  const recentOrders = db.orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Bem-vindo ao sistema Antunes Turismo.</p>
        </div>
        <button 
          onClick={onNewOrder}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <PlusCircle size={20} />
          Novo Pedido
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">BRUTO</span>
          </div>
          <h4 className="text-slate-500 text-sm font-medium">Faturamento Total</h4>
          <p className="text-2xl font-bold text-slate-800">R$ {stats.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <ArrowDownRight size={24} />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">CUSTOS</span>
          </div>
          <h4 className="text-slate-500 text-sm font-medium">Repasses e Fornecedores</h4>
          <p className="text-2xl font-bold text-slate-800">R$ {stats.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">LUCRO</span>
          </div>
          <h4 className="text-slate-500 text-sm font-medium">Lucro Real Líquido</h4>
          <p className="text-2xl font-bold text-slate-800">R$ {stats.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Últimos Pedidos</h3>
            <HistoryIcon size={18} className="text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{order.client.name}</td>
                    <td className="px-4 py-3 text-slate-500">{order.arrivalDate}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      R$ {(order.items.reduce((sum, item) => sum + (item.saleValue * item.quantity), 0) - order.discount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onPrint(order)} className="text-indigo-600 hover:text-indigo-800">
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Próximas Atividades</h3>
            <Calendar size={18} className="text-slate-400" />
          </div>
          <div className="p-4 space-y-4">
            {db.orders.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Nenhuma atividade agendada.</p>
            ) : (
              db.orders.slice(0, 4).map(o => (
                <div key={o.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold text-xs">
                    <span>{o.arrivalDate.split('/')[0]}</span>
                    <span className="text-[10px] opacity-70">DEZ</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{o.client.name}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{o.items.map(i => i.description).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-400">{o.vehicle}</span>
                    <p className="text-xs font-bold text-indigo-600">{o.pax} PAX</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Novo Pedido ---
export const OrderForm: React.FC<{ db: AppDatabase; onSubmit: (o: Order) => void; onCancel: () => void }> = ({ db, onSubmit, onCancel }) => {
  const [whatsappText, setWhatsappText] = useState('');
  const [formData, setFormData] = useState<Partial<Order>>({
    id: Math.random().toString(36).substr(2, 9),
    orderNumber: `ANT-${Date.now().toString().slice(-6)}`,
    client: { id: '', name: '', cpf: '', phone: '', email: '', hotel: '' },
    arrivalDate: format(new Date(), 'dd/MM/yyyy'),
    departureDate: format(addDays(new Date(), 7), 'dd/MM/yyyy'),
    pax: 2,
    vehicle: 'Sedan',
    items: [],
    discount: 0,
    paymentMethod: 'Pix+Cartao',
    status: 'Pendente',
    createdAt: new Date().toISOString()
  });

  const handleMagicImport = () => {
    const parsed = parseWhatsAppText(whatsappText);
    setFormData(prev => ({
      ...prev,
      ...parsed,
      client: { ...prev.client, ...parsed.client } as any,
      items: [...(prev.items || []), ...parsed.items]
    }));
  };

  const addItem = (serviceId: string) => {
    const service = db.products.find(p => p.id === serviceId);
    if (!service) return;
    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: service.description,
      quantity: 1,
      saleValue: service.defaultPrice,
      costValue: service.defaultCost
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== id) }));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  const totals = useMemo(() => {
    const sale = formData.items?.reduce((sum, i) => sum + (i.saleValue * i.quantity), 0) || 0;
    const cost = formData.items?.reduce((sum, i) => sum + (i.costValue * i.quantity), 0) || 0;
    const final = sale - (formData.discount || 0);
    return { sale, cost, final };
  }, [formData.items, formData.discount]);

  const generatePaymentNotes = () => {
    if (formData.paymentMethod === 'Pix+Cartao') {
      const pix = totals.final * 0.3;
      const resto = totals.final - pix;
      return `Condições de Pagamento:\n- Entrada via Pix: R$ ${pix.toFixed(2)} (reserva)\n- Saldo de R$ ${resto.toFixed(2)} pago no ato do serviço.`;
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Novo Pedido</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium">Cancelar</button>
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="text-indigo-600" size={20} />
          <h3 className="font-bold text-indigo-900">Importação Mágica (WhatsApp)</h3>
        </div>
        <textarea 
          placeholder="Cole aqui o texto desestruturado do cliente..."
          className="w-full h-24 p-4 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3 text-sm"
          value={whatsappText}
          onChange={(e) => setWhatsappText(e.target.value)}
        />
        <button 
          onClick={handleMagicImport}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Extrair Dados Automatizado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 mb-2 border-b pb-2">Dados do Cliente</h3>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">NOME COMPLETO</label>
            <input 
              type="text" list="client-names"
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.client?.name}
              onChange={(e) => setFormData(prev => ({ ...prev, client: { ...prev.client!, name: e.target.value } }))}
            />
            <datalist id="client-names">
              {db.clients.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">CPF</label>
              <input 
                type="text" 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                value={formData.client?.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, client: { ...prev.client!, cpf: e.target.value } }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">WHATSAPP</label>
              <input 
                type="text" 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                value={formData.client?.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, client: { ...prev.client!, phone: e.target.value } }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">HOTEL / POUSADA</label>
            <input 
              type="text" 
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
              value={formData.client?.hotel}
              onChange={(e) => setFormData(prev => ({ ...prev, client: { ...prev.client!, hotel: e.target.value } }))}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 mb-2 border-b pb-2">Logística</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">CHEGADA</label>
              <input 
                type="text" placeholder="DD/MM/AAAA"
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                value={formData.arrivalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">SAÍDA</label>
              <input 
                type="text" placeholder="DD/MM/AAAA"
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                value={formData.departureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">VEÍCULO</label>
              <select 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                value={formData.vehicle}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle: e.target.value as any }))}
              >
                <option value="Sedan">Sedan</option>
                <option value="Spin">Spin</option>
                <option value="Van">Van</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">PAX (Pessoas)</label>
              <input 
                type="number" 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                value={formData.pax}
                onChange={(e) => setFormData(prev => ({ ...prev, pax: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">VÔOS / INFOS EXTRAS</label>
            <input 
              type="text" 
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
              value={formData.flightInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, flightInfo: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Itens do Pacote</h3>
          <div className="flex gap-2">
            {db.products.map(p => (
              <button 
                key={p.id} 
                onClick={() => addItem(p.id)}
                className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-bold"
              >
                + {p.description}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 w-20">Qtd</th>
                <th className="px-4 py-3 w-32">Venda (R$)</th>
                <th className="px-4 py-3 w-32">Custo (R$)</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {formData.items?.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2">
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:ring-0 p-1"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:ring-0 p-1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:ring-0 p-1 font-bold text-indigo-600"
                      value={item.saleValue}
                      onChange={(e) => updateItem(item.id, 'saleValue', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-400"
                      value={item.costValue}
                      onChange={(e) => updateItem(item.id, 'costValue', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeItem(item.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">MÉTODO DE PAGAMENTO</label>
            <select 
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200"
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
            >
              <option value="Pix+Cartao">Entrada Pix + Saldo Viagem</option>
              <option value="LinkParceiro">Pagamento Integral Parceiro</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">NOTAS / OBSERVAÇÕES VOUCHER</label>
            <textarea 
              className="w-full h-24 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
              value={formData.notes || generatePaymentNotes()}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>R$ {totals.sale.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Desconto:</span>
              <div className="flex items-center gap-2">
                <span>- R$ </span>
                <input 
                  type="number" 
                  className="w-20 bg-white border border-slate-200 rounded px-1 py-0.5 text-right"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex justify-between text-rose-500 text-xs">
              <span>Custo Estimado:</span>
              <span>R$ {totals.cost.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-lg">Total Cliente:</span>
              <span className="font-black text-indigo-600 text-2xl">R$ {totals.final.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 font-bold text-sm bg-emerald-50 p-2 rounded mt-2">
              <span>Lucro Estimado:</span>
              <span>R$ {(totals.final - totals.cost).toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => onSubmit(formData as Order)}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-6"
          >
            Gerar Pedido e Voucher
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Agenda ---
export const Agenda: React.FC<{ db: AppDatabase }> = ({ db }) => {
  const agendaItems = useMemo(() => {
    const items: { date: string; title: string; client: string; type: 'Chegada' | 'Saída' | 'Passeio'; order: Order }[] = [];
    db.orders.forEach(o => {
      items.push({ date: o.arrivalDate, title: 'In: ' + (o.flightInfo || 'Traslado'), client: o.client.name, type: 'Chegada', order: o });
      items.push({ date: o.departureDate, title: 'Out: ' + (o.flightInfo || 'Traslado'), client: o.client.name, type: 'Saída', order: o });
      o.items.forEach(i => {
        if (i.date) {
          items.push({ date: i.date, title: i.description, client: o.client.name, type: 'Passeio', order: o });
        }
      });
    });
    return items.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    });
  }, [db]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Agenda Inteligente</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {agendaItems.length === 0 ? (
            <p className="text-center text-slate-400 py-12">Nenhum evento agendado.</p>
          ) : (
            agendaItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-800 block">{item.date}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    item.type === 'Chegada' ? 'bg-emerald-100 text-emerald-600' :
                    item.type === 'Saída' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                  <p className="text-sm text-slate-500">Passageiro: {item.client}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Calendar size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Financeiro ---
export const Financial: React.FC<{ db: AppDatabase; onAddExpense: (e: Expense) => void; onDeleteExpense: (id: string) => void }> = ({ db, onAddExpense, onDeleteExpense }) => {
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: 0, category: 'Operacional' });

  const stats = useMemo(() => {
    const revenue = db.orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + (i.saleValue * i.quantity), 0) - o.discount, 0);
    const costs = db.orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + (i.costValue * i.quantity), 0), 0);
    const expenses = db.expenses.reduce((acc, e) => acc + e.amount, 0);
    return { revenue, costs, expenses, profit: revenue - costs - expenses };
  }, [db]);

  const handleAdd = () => {
    if (!expenseForm.description || expenseForm.amount <= 0) return;
    onAddExpense({
      id: Math.random().toString(36).substr(2, 9),
      ...expenseForm,
      date: new Date().toISOString().split('T')[0]
    });
    setExpenseForm({ description: '', amount: 0, category: 'Operacional' });
  };

  const chartData = [
    { name: 'Receita', val: stats.revenue, fill: '#10b981' },
    { name: 'Custos', val: stats.costs, fill: '#f43f5e' },
    { name: 'Despesas', val: stats.expenses, fill: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">Balanço Geral</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Despesas Administrativas</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {db.expenses.map(e => (
                  <tr key={e.id}>
                    <td className="px-4 py-3">{e.date}</td>
                    <td className="px-4 py-3 font-medium">{e.description}</td>
                    <td className="px-4 py-3"><span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full uppercase font-bold">{e.category}</span></td>
                    <td className="px-4 py-3 text-right font-bold text-rose-500">R$ {e.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDeleteExpense(e.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold mb-6 opacity-60 uppercase text-xs tracking-widest">Resultado do Mês</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Faturamento</span>
                <span className="text-emerald-400 font-bold">R$ {stats.revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Custos (Repasse)</span>
                <span className="text-rose-400 font-bold">- R$ {stats.costs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Despesas Fixas</span>
                <span className="text-slate-400 font-bold">- R$ {stats.expenses.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Lucro Real</span>
                  <span className="text-indigo-400 font-black text-2xl">R$ {stats.profit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Nova Despesa</h3>
            <div className="space-y-3">
              <input 
                type="text" placeholder="Descrição" 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
              />
              <input 
                type="number" placeholder="Valor (R$)" 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                value={expenseForm.amount || ''}
                onChange={(e) => setExpenseForm({...expenseForm, amount: parseFloat(e.target.value) || 0})}
              />
              <select 
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
              >
                <option value="Operacional">Operacional</option>
                <option value="Marketing">Marketing</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Pessoal">Pessoal</option>
              </select>
              <button 
                onClick={handleAdd}
                className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                Lançar Despesa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Histórico ---
export const History: React.FC<{ db: AppDatabase; onDeleteOrder: (id: string) => void; onPrint: (o: Order) => void }> = ({ db, onDeleteOrder, onPrint }) => {
  const [search, setSearch] = useState('');
  
  const filtered = db.orders.filter(o => 
    o.client.name.toLowerCase().includes(search.toLowerCase()) || 
    o.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Histórico de Pedidos</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar pedido ou cliente..." 
            className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Nº Pedido</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{order.orderNumber}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{order.client.name}</td>
                <td className="px-6 py-4 text-slate-500">{order.arrivalDate} - {order.departureDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-600' : 
                    order.status === 'Pendente' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-800">
                  R$ {(order.items.reduce((sum, i) => sum + (i.saleValue * i.quantity), 0) - order.discount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onPrint(order)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Imprimir Voucher">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => onDeleteOrder(order.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Gestão de Cadastros ---
export const Management: React.FC<{ type: 'clients' | 'services'; db: AppDatabase; onUpdate: (items: any[]) => void }> = ({ type, db, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({ description: '', defaultPrice: 0, defaultCost: 0 });
  
  const list = type === 'clients' ? db.clients : db.products;
  const filtered = list.filter((item: any) => 
    (item.name || item.description).toLowerCase().includes(search.toLowerCase())
  );

  const handleAddService = () => {
    if (!newService.description) return;
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      description: newService.description!,
      defaultPrice: newService.defaultPrice || 0,
      defaultCost: newService.defaultCost || 0
    };
    onUpdate([...db.products, service]);
    setNewService({ description: '', defaultPrice: 0, defaultCost: 0 });
    setIsAddingService(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Deseja excluir este serviço?')) {
      onUpdate(db.products.filter(p => p.id !== id));
    }
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      onUpdate(db.clients.filter(c => c.id !== id));
    }
  };

  if (type === 'services') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Produtos</h2>
          <button 
            onClick={() => setIsAddingService(true)}
            className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <Plus size={20} strokeWidth={3} />
            Novo
          </button>
        </div>

        {isAddingService && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-indigo-100 space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Novo Produto</h3>
              <button onClick={() => setIsAddingService(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" placeholder="Nome do Produto" 
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
              />
              <input 
                type="number" placeholder="Venda (R$)" 
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                value={newService.defaultPrice || ''}
                onChange={(e) => setNewService({...newService, defaultPrice: parseFloat(e.target.value) || 0})}
              />
              <input 
                type="number" placeholder="Custo (R$)" 
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                value={newService.defaultCost || ''}
                onChange={(e) => setNewService({...newService, defaultCost: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsAddingService(false)} className="px-4 py-2 font-bold text-slate-400">Cancelar</button>
              <button onClick={handleAddService} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Salvar Produto</button>
            </div>
          </div>
        )}

        <div className="space-y-3 pb-12">
          {filtered.map((item: Service) => {
            const profit = item.defaultPrice - item.defaultCost;
            return (
              <div key={item.id} className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-100 transition-all group">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-700 text-lg">{item.description}</h4>
                </div>
                
                <div className="flex items-center gap-16 text-right">
                  <div className="w-24">
                    <span className="text-[#1e40af] font-bold text-xl whitespace-nowrap">
                      R$ {item.defaultPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="w-24">
                    <span className="text-slate-400 font-medium text-lg whitespace-nowrap">
                      R$ {item.defaultCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="w-28">
                    <span className="text-emerald-500 font-bold text-xl whitespace-nowrap">
                      + R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="w-10 flex justify-end">
                    <button 
                      onClick={() => handleDeleteService(item.id)}
                      className="text-rose-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clientes Cadastrados</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Filtrar clientes..." 
            className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 outline-none w-64 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">CPF</th>
              <th className="px-6 py-4">Telefone</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((item: Client) => (
              <tr key={item.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.cpf}</td>
                <td className="px-6 py-4">{item.phone}</td>
                <td className="px-6 py-4 text-right">
                   <button 
                      onClick={() => handleDeleteClient(item.id)}
                      className="text-rose-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
