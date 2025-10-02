import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, setDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { app, db } from '../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const Estoque = ({ user }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    descricao: '',
    tamanho: '',
    quantidade: 0
  });
  const [error, setError] = useState('');

  const tamanhos = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', 'U'];

  useEffect(() => {
    if (!user) return;

    const produtosCollection = collection(db, 'produtos');
    const q = query(produtosCollection, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const produtosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(produtosData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching produtos: ", error);
      setError("Erro ao carregar produtos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.descricao || !formData.tamanho) {
      setError('Descrição e tamanho são obrigatórios');
      return;
    }

    try {
      const productData = {
        ...formData,
        userId: user.uid,
      };

      if (editingProduct) {
        const productDoc = doc(db, 'produtos', editingProduct.id);
        await setDoc(productDoc, productData, { merge: true });
      } else {
        const produtosCollection = collection(db, 'produtos');
        await addDoc(produtosCollection, productData);
      }
      
      setDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setError('Erro ao salvar produto');
    }
  };

  const handleEdit = (produto) => {
    setEditingProduct(produto);
    setFormData({
      descricao: produto.descricao,
      tamanho: produto.tamanho,
      quantidade: produto.quantidade
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const productDoc = doc(db, 'produtos', id);
        await deleteDoc(productDoc);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        setError('Erro ao excluir produto');
      }
    }
  };

  const resetForm = () => {
    setFormData({ descricao: '', tamanho: '', quantidade: 0 });
    setEditingProduct(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Estoque</h2>
          <p className="text-muted-foreground">Gerencie seus produtos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ex: Camiseta básica preta"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamanho">Tamanho</Label>
                <Select 
                  value={formData.tamanho} 
                  onValueChange={(value) => setFormData({...formData, tamanho: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {tamanhos.map(tamanho => (
                      <SelectItem key={tamanho} value={tamanho}>
                        {tamanho}
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
                  min="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 0})}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Atualizar' : 'Salvar'}
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
        {produtos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum produto cadastrado ainda.
                <br />
                Clique em "Novo Produto" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          produtos.map(produto => (
            <Card key={produto.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{produto.descricao}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Tamanho: {produto.tamanho}</span>
                      <span className={`font-medium ${
                        produto.quantidade <= 5 ? 'text-red-600' : 
                        produto.quantidade <= 10 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        Qtd: {produto.quantidade}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(produto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
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

export default Estoque;
