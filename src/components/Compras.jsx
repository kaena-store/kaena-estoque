import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, runTransaction, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const db = getFirestore(app);

const Compras = ({ user }) => {
  const [compras, setCompras] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState(null);
  const [formData, setFormData] = useState({
    produtoId: '',
    quantidade: 1,
    precoCusto: 0,
    data: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const comprasCollection = collection(db, 'compras');
    const qCompras = query(comprasCollection, where("userId", "==", user.uid));
    const unsubscribeCompras = onSnapshot(qCompras, (snapshot) => {
      const comprasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompras(comprasData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching compras: ", error);
      setError("Erro ao carregar compras.");
      setLoading(false);
    });

    const produtosCollection = collection(db, 'produtos');
    const qProdutos = query(produtosCollection, where("userId", "==", user.uid));
    const unsubscribeProdutos = onSnapshot(qProdutos, (snapshot) => {
      const produtosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(produtosData);
    });

    return () => {
      unsubscribeCompras();
      unsubscribeProdutos();
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.produtoId || !formData.quantidade || !formData.precoCusto) {
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
        const novaQuantidade = produtoData.quantidade + parseInt(formData.quantidade);

        const compraData = {
          ...formData,
          userId: user.uid,
        };

        if (editingCompra) {
          const compraDocRef = doc(db, 'compras', editingCompra.id);
          const compraDoc = await transaction.get(compraDocRef);
          const quantidadeAntiga = compraDoc.data().quantidade;
          const quantidadeAtualizada = produtoData.quantidade - quantidadeAntiga + parseInt(formData.quantidade);
          
          transaction.update(produtoDocRef, { quantidade: quantidadeAtualizada });
          transaction.set(compraDocRef, compraData, { merge: true });
        } else {
          const comprasCollection = collection(db, 'compras');
          transaction.update(produtoDocRef, { quantidade: novaQuantidade });
          transaction.set(doc(comprasCollection), compraData);
        }
      });

      setDialogOpen(false);
      setEditingCompra(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      setError('Erro ao salvar compra');
    }
  };

  const handleEdit = (compra) => {
    setEditingCompra(compra);
    setFormData({
      produtoId: compra.produtoId,
      quantidade: compra.quantidade,
      precoCusto: compra.precoCusto,
      data: compra.data
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta compra?')) {
      try {
        await runTransaction(db, async (transaction) => {
          const compraDocRef = doc(db, 'compras', id);
          const compraDoc = await transaction.get(compraDocRef);
          const { produtoId, quantidade } = compraDoc.data();

          const produtoDocRef = doc(db, 'produtos', produtoId);
          const produtoDoc = await transaction.get(produtoDocRef);
          const novaQuantidade = produtoDoc.data().quantidade - quantidade;

          transaction.update(produtoDocRef, { quantidade: novaQuantidade });
          transaction.delete(compraDocRef);
        });
      } catch (error) {
        console.error('Erro ao excluir compra:', error);
        setError('Erro ao excluir compra');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      produtoId: '',
      quantidade: 1,
      precoCusto: 0,
      data: new Date().toISOString().split('T')[0]
    });
    setEditingCompra(null);
    setError('');
  };

  const getProdutoNome = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? `${produto.descricao} (${produto.tamanho})` : 'Produto não encontrado';
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

  const comprasOrdenadas = [...compras].sort((a, b) => new Date(b.data) - new Date(a.data));

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Carregando compras...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compras</h2>
          <p className="text-muted-foreground">Registre suas compras de estoque</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCompra ? 'Editar Compra' : 'Nova Compra'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        {produto.descricao} ({produto.tamanho})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoCusto">Preço de Custo (R$)</Label>
                <Input
                  id="precoCusto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoCusto}
                  onChange={(e) => setFormData({...formData, precoCusto: e.target.value})}
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
                  {editingCompra ? 'Atualizar' : 'Salvar'}
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
        {comprasOrdenadas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma compra registrada ainda.
                <br />
                Clique em "Nova Compra" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          comprasOrdenadas.map(compra => (
            <Card key={compra.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{getProdutoNome(compra.produtoId)}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Qtd: {compra.quantidade}</span>
                      <span>Custo: {formatCurrency(compra.precoCusto)}</span>
                      <span>Total: {formatCurrency(compra.quantidade * compra.precoCusto)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(compra.data)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(compra)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(compra.id)}
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

export default Compras;

