
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Dashboard, OrderForm, Agenda, Financial, Management, History } from './components/Navigation';
import { AppDatabase, Screen, Order, Client, Service, Expense } from './types';
import { getDB, saveDB, backupDB } from './services/db';
import { PrintVoucher } from './components/PrintVoucher';

const App: React.FC = () => {
  const [db, setDb] = useState<AppDatabase>(getDB());
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    saveDB(db);
  }, [db]);

  const handleAddOrder = (order: Order) => {
    setDb(prev => ({
      ...prev,
      orders: [order, ...prev.orders],
      // Auto-save client if new
      clients: prev.clients.some(c => c.cpf === order.client.cpf) 
        ? prev.clients 
        : [...prev.clients, order.client]
    }));
    setCurrentScreen('dashboard');
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Deseja realmente excluir este pedido?')) {
      setDb(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== id) }));
    }
  };

  const handleAddExpense = (expense: Expense) => {
    setDb(prev => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  };

  const handleDeleteExpense = (id: string) => {
    setDb(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const handleUpdateProducts = (products: Service[]) => {
    setDb(prev => ({ ...prev, products }));
  };

  const handleUpdateClients = (clients: Client[]) => {
    setDb(prev => ({ ...prev, clients }));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard 
                  db={db} 
                  onNewOrder={() => setCurrentScreen('new-order')} 
                  onPrint={(o) => { setSelectedOrderForPrint(o); setTimeout(() => window.print(), 100); }} 
               />;
      case 'new-order':
        return <OrderForm db={db} onSubmit={handleAddOrder} onCancel={() => setCurrentScreen('dashboard')} />;
      case 'agenda':
        return <Agenda db={db} />;
      case 'financial':
        return <Financial db={db} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />;
      case 'clients':
        return <Management type="clients" db={db} onUpdate={handleUpdateClients} />;
      case 'services':
        return <Management type="services" db={db} onUpdate={handleUpdateProducts} />;
      case 'history':
        return <History db={db} onDeleteOrder={handleDeleteOrder} onPrint={(o) => { setSelectedOrderForPrint(o); setTimeout(() => window.print(), 100); }} />;
      default:
        return <Dashboard db={db} onNewOrder={() => setCurrentScreen('new-order')} onPrint={() => {}} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <Layout currentScreen={currentScreen} onNavigate={setCurrentScreen} onBackup={backupDB}>
        <div className="p-6">
          {renderScreen()}
        </div>
      </Layout>

      {/* Printing Layer */}
      {selectedOrderForPrint && (
        <div className="print-only">
          <PrintVoucher order={selectedOrderForPrint} />
        </div>
      )}
    </div>
  );
};

export default App;
