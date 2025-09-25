import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { migrateData } from './migration';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';

// Componentes
import Dashboard from './components/Dashboard';
import Estoque from './components/Estoque';
import Compras from './components/Compras';
import Vendas from './components/Vendas';
import Clientes from './components/Clientes';
import Navigation from './components/Navigation';
import Login from './components/Login';

const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const doMigration = async () => {
      if (user) {
        await migrateData(user);
        setMigrating(false);
      }
    };
    doMigration();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {user ? (
          <>
            <Navigation />
            <main className="pb-16">
              {migrating ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-lg">Migrando dados...</div>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/estoque" element={<Estoque user={user} />} />
                  <Route path="/compras" element={<Compras user={user} />} />
                  <Route path="/vendas" element={<Vendas user={user} />} />
                  <Route path="/clientes" element={<Clientes user={user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </main>
          </>
        ) : (
          <Login />
        )}
      </div>
    </Router>
  );
}

export default App;

