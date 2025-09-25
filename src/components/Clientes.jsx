import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Users, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const db = getFirestore(app);

const Clientes = ({ user }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const clientesCollection = collection(db, 'clientes');
    const q = query(clientesCollection, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching clientes: ", error);
      setError("Erro ao carregar clientes.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nome || !formData.whatsapp) {
      setError('Nome e WhatsApp são obrigatórios');
      return;
    }

    const whatsappClean = formData.whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 10 || whatsappClean.length > 11) {
      setError('WhatsApp deve ter 10 ou 11 dígitos');
      return;
    }

    try {
      const clienteData = {
        ...formData,
        userId: user.uid,
        nome: formData.nome.trim(),
        whatsapp: whatsappClean
      };

      if (editingCliente) {
        const clienteDoc = doc(db, 'clientes', editingCliente.id);
        await setDoc(clienteDoc, clienteData, { merge: true });
      } else {
        const clientesCollection = collection(db, 'clientes');
        await addDoc(clientesCollection, clienteData);
      }
      
      setDialogOpen(false);
      setEditingCliente(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setError('Erro ao salvar cliente');
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      whatsapp: cliente.whatsapp
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const clienteDoc = doc(db, 'clientes', id);
        await deleteDoc(clienteDoc);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        setError('Erro ao excluir cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', whatsapp: '' });
    setEditingCliente(null);
    setError('');
  };

  const formatWhatsApp = (whatsapp) => {
    const clean = whatsapp.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    } else if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return whatsapp;
  };

  const openWhatsApp = (whatsapp) => {
    const clean = whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${clean}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="11999999999"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Digite apenas números (DDD + número)
                </p>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingCliente ? 'Atualizar' : 'Salvar'}
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
        {clientes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum cliente cadastrado ainda.
                <br />
                Clique em "Novo Cliente" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          clientes.map(cliente => (
            <Card key={cliente.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{cliente.nome}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{formatWhatsApp(cliente.whatsapp)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openWhatsApp(cliente.whatsapp)}
                        className="h-6 w-6 p-0"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
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

export default Clientes;