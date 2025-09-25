import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/estoque', icon: Package, label: 'Estoque' },
    { path: '/compras', icon: ShoppingCart, label: 'Compras' },
    { path: '/vendas', icon: TrendingUp, label: 'Vendas' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Kaena Estoque</h1>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;

