import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { migrateData } from './migration';

// Componentes
import Dashboard from './components/Dashboard';
import Estoque from './components/Estoque';
import Compras from './components/Compras';
import Vendas from './components/Vendas';
import Clientes from './components/Clientes';
import Navigation from './components/Navigation';

function App() {
  // Para o MVP, vamos simular que o usuário está logado
  const [user, setUser] = useState({ email: 'teste@kaena.com' });
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(true);

  useEffect(() => {
    const doMigration = async () => {
      await migrateData();
      setMigrating(false);
    };
    doMigration();
  }, []);

  if (loading || migrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{migrating ? 'Migrando dados...' : 'Carregando...'}</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

