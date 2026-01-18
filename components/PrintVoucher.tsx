
import React from 'react';
import { Order } from '../types';

export const PrintVoucher: React.FC<{ order: Order }> = ({ order }) => {
  const total = order.items.reduce((sum, i) => sum + (i.saleValue * i.quantity), 0) - order.discount;

  return (
    <div className="p-12 text-slate-900 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">ANTUNES TURISMO</h1>
          <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">Voucher de Serviço & Fatura</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm">Ref: {order.orderNumber}</p>
          <p className="text-xs text-slate-400">Emissão: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">Passageiro Principal</h2>
          <div>
            <p className="font-bold text-lg">{order.client.name}</p>
            <p className="text-sm">CPF: {order.client.cpf}</p>
            <p className="text-sm">WhatsApp: {order.client.phone}</p>
            <p className="text-sm">Hospedagem: {order.client.hotel}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">Logística da Viagem</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400">CHEGADA</p>
              <p className="text-sm font-bold">{order.arrivalDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">SAÍDA</p>
              <p className="text-sm font-bold">{order.departureDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">PAX</p>
              <p className="text-sm font-bold">{order.pax} Adultos</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400">VEÍCULO</p>
              <p className="text-sm font-bold">{order.vehicle}</p>
            </div>
          </div>
          {order.flightInfo && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Informações de Vôo</p>
              <p className="text-sm">{order.flightInfo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-12">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">Serviços Contratados</h2>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2 px-4">Descrição do Item</th>
              <th className="py-2 px-4 text-center">Qtd</th>
              <th className="py-2 px-4 text-right">Valor Unit.</th>
              <th className="py-2 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {order.items.map(item => (
              <tr key={item.id}>
                <td className="py-3 px-4 font-medium">{item.description}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right">R$ {item.saleValue.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-bold">R$ {(item.saleValue * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900">
              <td colSpan={3} className="py-4 px-4 text-right font-bold text-slate-500 uppercase text-xs">Desconto Concedido:</td>
              <td className="py-4 px-4 text-right font-bold text-slate-900">R$ {order.discount.toFixed(2)}</td>
            </tr>
            <tr className="bg-slate-900 text-white">
              <td colSpan={3} className="py-4 px-4 text-right font-black uppercase text-sm">Total Geral:</td>
              <td className="py-4 px-4 text-right font-black text-xl">R$ {total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment & Footer */}
      <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instruções de Pagamento</h3>
          <p className="text-xs whitespace-pre-wrap leading-relaxed text-slate-600">{order.notes || "O pagamento deve ser realizado conforme combinado previamente."}</p>
        </div>
        <div className="text-right flex flex-col justify-end space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Antunes Turismo Ltda</p>
            <p className="text-[10px] text-slate-400">CNPJ: 00.000.000/0001-00</p>
            <p className="text-[10px] text-slate-400">contato@antunesturismo.com.br</p>
          </div>
        </div>
      </div>

      <div className="mt-20 border-t-2 border-dashed border-slate-200 pt-8 text-center">
        <p className="text-[10px] text-slate-300 uppercase font-black">Este documento serve como comprovante de reserva e fatura comercial.</p>
      </div>
    </div>
  );
};
