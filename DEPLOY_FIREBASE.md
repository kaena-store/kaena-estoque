# Deploy no Firebase - Kaena Estoque

## Pré-requisitos

1. **Firebase CLI instalado**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login no Firebase**
   ```bash
   firebase login
   ```

## Configuração do Firebase

### 1. Configurar Authentication
1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto `kaena-d99b5`
3. Vá em **Authentication** > **Sign-in method**
4. Habilite **Email/Password**

### 2. Configurar Firestore Database
1. Vá em **Firestore Database**
2. Clique em **Create database**
3. Escolha **Start in test mode** (para desenvolvimento)
4. Selecione uma localização próxima

### 3. Configurar Hosting
1. Vá em **Hosting**
2. Clique em **Get started**
3. Siga as instruções para configurar

## Deploy da Aplicação

### 1. Preparar o projeto para produção

```bash
# Navegar para o diretório do projeto
cd kaena-estoque

# Instalar dependências
pnpm install

# Construir a aplicação para produção
pnpm run build
```

### 2. Inicializar Firebase no projeto

```bash
# Inicializar Firebase
firebase init

# Selecionar:
# - Hosting: Configure files for Firebase Hosting
# - Firestore: Configure security rules and indexes files for Firestore

# Configurações:
# - Use an existing project: kaena-d99b5
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds and deploys with GitHub: No
```

### 3. Configurar regras do Firestore

Edite o arquivo `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Fazer o deploy

```bash
# Deploy completo (Hosting + Firestore rules)
firebase deploy

# Ou apenas o hosting
firebase deploy --only hosting
```

## Configuração da Aplicação para Produção

### 1. Habilitar Firebase Authentication

Descomente e ajuste o código em `src/App.jsx`:

```javascript
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';

// Remover a linha que simula usuário logado:
// const [user, setUser] = useState({ email: 'teste@kaena.com' });

// Descomentar o código de autenticação real:
const [user, setUser] = useState(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

if (!user) {
  return <Login />;
}
```

### 2. Migrar dados do localStorage para Firestore

Substitua os hooks `useLocalStorage` pelos hooks do Firebase nos componentes:

- `src/components/Estoque.jsx`
- `src/components/Compras.jsx`
- `src/components/Vendas.jsx`
- `src/components/Clientes.jsx`
- `src/components/Dashboard.jsx`

Use as funções do Firestore:
```javascript
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
```

## URLs após o deploy

- **Aplicação**: `https://kaena-d99b5.web.app`
- **Console Firebase**: `https://console.firebase.google.com/project/kaena-d99b5`

## Comandos úteis

```bash
# Ver logs do deploy
firebase deploy --debug

# Fazer deploy apenas do hosting
firebase deploy --only hosting

# Fazer deploy apenas das regras do Firestore
firebase deploy --only firestore:rules

# Servir localmente (simulando produção)
firebase serve
```

## Notas importantes

1. **Segurança**: As regras do Firestore estão configuradas para permitir acesso apenas a usuários autenticados
2. **Backup**: Considere fazer backup dos dados regularmente
3. **Monitoramento**: Use o console do Firebase para monitorar uso e performance
4. **Custos**: Monitore os custos no console do Firebase, especialmente reads/writes do Firestore

## Estrutura de dados no Firestore

```
/produtos
  - id (auto-generated)
  - descricao: string
  - tamanho: string
  - quantidade: number

/clientes
  - id (auto-generated)
  - nome: string
  - whatsapp: string

/compras
  - id (auto-generated)
  - produtoId: string
  - quantidade: number
  - precoCusto: number
  - data: timestamp

/vendas
  - id (auto-generated)
  - clienteId: string
  - produtoId: string
  - quantidade: number
  - precoVenda: number
  - data: timestamp
```

