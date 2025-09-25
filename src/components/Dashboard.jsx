import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const db = getFirestore(app);
const produtosCollection = collection(db, 'produtos');
const clientesCollection = collection(db, 'clientes');
const vendasCollection = collection(db, 'vendas');
const comprasCollection = collection(db, 'compras');

const Dashboard = () => {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalClientes: 0,
    vendasMes: 0,
    lucroMes: 0,
    comprasMes: 0
  });

  useEffect(() => {
    const unsubscribeProdutos = onSnapshot(produtosCollection, (snapshot) => {
      const produtosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(produtosData);
      setLoading(false);
    });

    const unsubscribeClientes = onSnapshot(clientesCollection, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
    });

    const unsubscribeVendas = onSnapshot(vendasCollection, (snapshot) => {
      const vendasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendas(vendasData);
    });

    const unsubscribeCompras = onSnapshot(comprasCollection, (snapshot) => {
      const comprasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompras(comprasData);
    });

    return () => {
      unsubscribeProdutos();
      unsubscribeClientes();
      unsubscribeVendas();
      unsubscribeCompras();
    };
  }, []);

  useEffect(() => {
    const calcularStats = () => {
      // Total de produtos e clientes
      const totalProdutos = produtos.length;
      const totalClientes = clientes.length;

      // Vendas e compras do mês atual
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      // Filtrar vendas do mês
      const vendasDoMes = vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        dataVenda.setMinutes(dataVenda.getMinutes() + dataVenda.getTimezoneOffset());
        return dataVenda >= inicioMes;
      });

      // Filtrar compras do mês
      const comprasDoMes = compras.filter(compra => {
        const dataCompra = new Date(compra.data);
        dataCompra.setMinutes(dataCompra.getMinutes() + dataCompra.getTimezoneOffset());
        return dataCompra >= inicioMes;
      });

      // Calcular totais
      let vendasMes = 0;
      let lucroMes = 0;

      vendasDoMes.forEach(venda => {
        const totalVenda = venda.precoVenda * venda.quantidade;
        vendasMes += totalVenda;

        // Calcular lucro (assumindo preço de custo médio)
        const produto = produtos.find(p => p.id === venda.produtoId);
        const comprasProduto = compras.filter(c => c.produtoId === venda.produtoId);
        let precoCustoMedio = 0;

        if (comprasProduto.length > 0) {
          const totalCusto = comprasProduto.reduce((acc, c) => acc + (c.precoCusto * c.quantidade), 0);
          const totalQuantidade = comprasProduto.reduce((acc, c) => acc + c.quantidade, 0);
          precoCustoMedio = totalCusto / totalQuantidade;
        }

        const lucroItem = (venda.precoVenda - precoCustoMedio) * venda.quantidade;
        lucroMes += lucroItem;
      });

      let comprasMes = 0;
      comprasDoMes.forEach(compra => {
        comprasMes += compra.precoCusto * compra.quantidade;
      });

      setStats({
        totalProdutos,
        totalClientes,
        vendasMes,
        lucroMes,
        comprasMes
      });
    };

    if (!loading) {
      calcularStats();
    }
  }, [produtos, clientes, vendas, compras, loading]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.vendasMes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de vendas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.lucroMes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro líquido este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compras do Mês
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.comprasMes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total investido este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalProdutos}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalClientes}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margem de Lucro
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.vendasMes > 0 ?
                `${((stats.lucroMes / stats.vendasMes) * 100).toFixed(1)}%` :
                '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Margem de lucro este mês
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

