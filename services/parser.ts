
import { Order, OrderItem } from '../types';

export const parseWhatsAppText = (text: string): Partial<Order> & { items: OrderItem[] } => {
  const result: Partial<Order> & { items: OrderItem[] } = {
    items: []
  };

  // Basic regex patterns
  const patterns = {
    name: /(?:Nome|Cliente|Pax):\s*(.*)/i,
    cpf: /(?:CPF):\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
    phone: /(?:Tel|WhatsApp|Cel):\s*(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/i,
    hotel: /(?:Hotel|Hospedagem|Local):\s*(.*)/i,
    arrival: /(?:Chegada|In|Data Chegada):\s*(\d{2}\/\d{2}(?:\/\d{2,4})?)/i,
    departure: /(?:Saída|Out|Data Saída):\s*(\d{2}\/\d{2}(?:\/\d{2,4})?)/i,
    pax: /(?:Pax|Pessoas|Qtd):\s*(\d+)/i,
    flight: /(?:Voo|Vôo):\s*(.*)/i
  };

  // Match basic fields
  if (patterns.name.test(text)) result.client = { ...result.client, name: text.match(patterns.name)![1].trim() } as any;
  if (patterns.cpf.test(text)) result.client = { ...result.client, cpf: text.match(patterns.cpf)![1].trim() } as any;
  if (patterns.phone.test(text)) result.client = { ...result.client, phone: text.match(patterns.phone)![1].trim() } as any;
  if (patterns.hotel.test(text)) result.client = { ...result.client, hotel: text.match(patterns.hotel)![1].trim() } as any;
  if (patterns.arrival.test(text)) result.arrivalDate = text.match(patterns.arrival)![1].trim();
  if (patterns.departure.test(text)) result.departureDate = text.match(patterns.departure)![1].trim();
  if (patterns.pax.test(text)) result.pax = parseInt(text.match(patterns.pax)![1]);
  if (patterns.flight.test(text)) result.flightInfo = text.match(patterns.flight)![1].trim();

  // Item parser (heuristic: lines with R$ and a name)
  const lines = text.split('\n');
  lines.forEach(line => {
    const priceMatch = line.match(/R\$\s*(\d+(?:[.,]\d{2})?)/i);
    if (priceMatch && line.length > 10) {
      const description = line.replace(/R\$\s*(\d+(?:[.,]\d{2})?)/i, '').trim();
      const price = parseFloat(priceMatch[1].replace(',', '.'));
      result.items.push({
        id: Math.random().toString(36).substr(2, 9),
        description: description,
        quantity: 1,
        saleValue: price,
        costValue: price * 0.7 // Default estimate for cost
      });
    }
  });

  return result;
};
