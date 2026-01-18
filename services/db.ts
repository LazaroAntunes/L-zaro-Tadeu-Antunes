
import { AppDatabase, Client, Order, Service, Expense } from '../types';

const DB_KEY = 'antunes_turismo_db_v1';

const initialDB: AppDatabase = {
  orders: [],
  clients: [],
  products: [
    { id: '1', description: 'Transfer Sedan (4 pax)', defaultPrice: 325, defaultCost: 250 },
    { id: '2', description: 'Transfer Spin (6 pax)', defaultPrice: 390, defaultCost: 300 },
    { id: '3', description: 'City Tour Gramado', defaultPrice: 364, defaultCost: 280 },
    { id: '4', description: 'Tour Bento Gonçalves', defaultPrice: 780, defaultCost: 600 },
    { id: '5', description: 'Tour Uva e Vinho (Adulto)', defaultPrice: 400, defaultCost: 340 },
    { id: '6', description: 'Transfer Van Compart.', defaultPrice: 80, defaultCost: 55 }
  ],
  expenses: []
};

export const getDB = (): AppDatabase => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return initialDB;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse DB", e);
    return initialDB;
  }
};

export const saveDB = (db: AppDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const backupDB = () => {
  const data = getDB();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_antunes_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
