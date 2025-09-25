import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, runTransaction } from 'firebase/firestore';
import { app } from '../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const db = getFirestore(app);
const vendasCollection = collection(db, 'vendas');
const produtosCollection = collection(db, 'produtos');
const clientesCollection = collection(db, 'clientes');

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    produtoId: '',
    quantidade: 1,
    precoVenda: 0,
    data: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribeVendas = onSnapshot(vendasCollection, (snapshot) => {
      const vendasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendas(vendasData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vendas: ", error);
      setError("Erro ao carregar vendas.");
      setLoading(false);
    });

    const unsubscribeProdutos = onSnapshot(produtosCollection, (snapshot) => {
      const produtosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(produtosData);
    });

    const unsubscribeClientes = onSnapshot(clientesCollection, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
    });

    return () => {
      unsubscribeVendas();
      unsubscribeProdutos();
      unsubscribeClientes();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.clienteId || !formData.produtoId || !formData.quantidade || !formData.precoVenda) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const produtoDocRef = doc(db, 'produtos', formData.produtoId);
        const produtoDoc = await transaction.get(produtoDocRef);

        if (!produtoDoc.exists()) {
          throw new Error("Produto não encontrado!");
        }

        const produtoData = produtoDoc.data();
        const novaQuantidade = produtoData.quantidade - parseInt(formData.quantidade);

        if (editingVenda) {
          const vendaDocRef = doc(db, 'vendas', editingVenda.id);
          const vendaDoc = await transaction.get(vendaDocRef);
          const quantidadeAntiga = vendaDoc.data().quantidade;
          const quantidadeAtualizada = produtoData.quantidade + quantidadeAntiga - parseInt(formData.quantidade);

          if (quantidadeAtualizada < 0) {
            throw new Error("Estoque insuficiente!");
          }

          transaction.update(produtoDocRef, { quantidade: quantidadeAtualizada });
          transaction.update(vendaDocRef, formData);
        } else {
          if (novaQuantidade < 0) {
            throw new Error("Estoque insuficiente!");
          }

          transaction.update(produtoDocRef, { quantidade: novaQuantidade });
          transaction.set(doc(vendasCollection), formData);
        }
      });

      setDialogOpen(false);
      setEditingVenda(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      setError(error.message);
    }
  };

  const handleEdit = (venda) => {
    setEditingVenda(venda);
    setFormData({
      clienteId: venda.clienteId,
      produtoId: venda.produtoId,
      quantidade: venda.quantidade,
      precoVenda: venda.precoVenda,
      data: venda.data
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await runTransaction(db, async (transaction) => {
          const vendaDocRef = doc(db, 'vendas', id);
          const vendaDoc = await transaction.get(vendaDocRef);
          const { produtoId, quantidade } = vendaDoc.data();

          const produtoDocRef = doc(db, 'produtos', produtoId);
          const produtoDoc = await transaction.get(produtoDocRef);
          const novaQuantidade = produtoDoc.data().quantidade + quantidade;

          transaction.update(produtoDocRef, { quantidade: novaQuantidade });
          transaction.delete(vendaDocRef);
        });
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        setError('Erro ao excluir venda');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      produtoId: '',
      quantidade: 1,
      precoVenda: 0,
      data: new Date().toISOString().split('T')[0]
    });
    setEditingVenda(null);
    setError('');
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getProdutoNome = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? `${produto.descricao} (${produto.tamanho})` : 'Produto não encontrado';
  };

  const getProdutoEstoque = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? produto.quantidade : 0;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  const vendasOrdenadas = [...vendas].sort((a, b) => new Date(b.data) - new Date(a.data));

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Carregando vendas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vendas</h2>
          <p className="text-muted-foreground">Registre suas vendas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVenda ? 'Editar Venda' : 'Nova Venda'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select 
                  value={formData.clienteId} 
                  onValueChange={(value) => setFormData({...formData, clienteId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="produto">Produto</Label>
                <Select 
                  value={formData.produtoId} 
                  onValueChange={(value) => setFormData({...formData, produtoId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map(produto => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.descricao} ({produto.tamanho}) - Estoque: {produto.quantidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.produtoId && (
                  <p className="text-xs text-muted-foreground">
                    Estoque disponível: {getProdutoEstoque(formData.produtoId)} unidades
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  max={formData.produtoId ? getProdutoEstoque(formData.produtoId) : undefined}
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
                <Input
                  id="precoVenda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoVenda}
                  onChange={(e) => setFormData({...formData, precoVenda: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingVenda ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {vendasOrdenadas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma venda registrada ainda.
                <br />
                Clique em "Nova Venda" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          vendasOrdenadas.map(venda => (
            <Card key={venda.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{getClienteNome(venda.clienteId)}</h3>
                    <p className="text-sm text-muted-foreground">{getProdutoNome(venda.produtoId)}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Qtd: {venda.quantidade}</span>
                      <span>Preço: {formatCurrency(venda.precoVenda)}</span>
                      <span className="font-medium text-green-600">
                        Total: {formatCurrency(venda.quantidade * venda.precoVenda)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(venda.data)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(venda)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(venda.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Vendas;

