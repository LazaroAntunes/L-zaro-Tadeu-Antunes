
export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  hotel: string;
}

export interface Service {
  id: string;
  description: string;
  defaultPrice: number;
  defaultCost: number;
}

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  saleValue: number;
  costValue: number;
  date?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: Client;
  arrivalDate: string;
  departureDate: string;
  flightInfo: string;
  pax: number;
  vehicle: 'Sedan' | 'Spin' | 'Van' | 'Outro';
  items: OrderItem[];
  discount: number;
  paymentMethod: 'Pix+Cartao' | 'LinkParceiro' | 'Outro';
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface AppDatabase {
  orders: Order[];
  clients: Client[];
  products: Service[];
  expenses: Expense[];
}

export type Screen = 'dashboard' | 'new-order' | 'agenda' | 'clients' | 'services' | 'financial' | 'history';
