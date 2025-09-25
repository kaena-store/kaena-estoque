# Kaena Estoque - MVP

Sistema de controle de estoque de roupas desenvolvido em React com Firebase, otimizado para uso mobile.

## 🚀 Funcionalidades

### ✅ Implementadas no MVP

- **Dashboard**: Visão geral com métricas de vendas, lucro, compras e estoque
- **Controle de Estoque**: Cadastro de produtos com descrição e tamanho (PP, P, M, G, GG, XG, XXG)
- **Registro de Compras**: Controle de compras com atualização automática do estoque
- **Registro de Vendas**: Controle de vendas com validação de estoque disponível
- **Gestão de Clientes**: Cadastro de clientes com nome e WhatsApp (com link direto)
- **Interface Mobile**: Design responsivo otimizado para smartphones
- **Navegação Bottom Tab**: Navegação intuitiva no estilo mobile

### 📊 Métricas do Dashboard

- Vendas do mês atual
- Lucro líquido do mês
- Total de compras do mês
- Quantidade de produtos em estoque
- Número de clientes cadastrados
- Margem de lucro percentual

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Ícones**: Lucide React
- **Backend**: Firebase (Firestore + Authentication)
- **Hospedagem**: Firebase Hosting
- **Armazenamento Local**: localStorage (para desenvolvimento)

## 📱 Design Mobile-First

- Interface otimizada para smartphones
- Navegação bottom tab intuitiva
- Cards responsivos
- Formulários touch-friendly
- Modais adaptados para mobile

## 🎯 Fluxo de Uso

1. **Login/Cadastro**: Autenticação via email/senha
2. **Dashboard**: Visualização das métricas principais
3. **Cadastro de Produtos**: Adicionar produtos ao estoque
4. **Registro de Compras**: Registrar compras e atualizar estoque automaticamente
5. **Cadastro de Clientes**: Adicionar clientes com WhatsApp
6. **Registro de Vendas**: Vender produtos com validação de estoque
7. **Acompanhamento**: Monitorar lucro e performance via dashboard

## 🔧 Instalação e Desenvolvimento

```bash
# Clonar o repositório
git clone <repository-url>
cd kaena-estoque

# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm run dev

# Construir para produção
pnpm run build
```

## 🚀 Deploy

Consulte o arquivo `DEPLOY_FIREBASE.md` para instruções detalhadas de deploy no Firebase.

## 📋 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de UI (shadcn/ui)
│   ├── Dashboard.jsx    # Dashboard principal
│   ├── Estoque.jsx      # Gestão de estoque
│   ├── Compras.jsx      # Registro de compras
│   ├── Vendas.jsx       # Registro de vendas
│   ├── Clientes.jsx     # Gestão de clientes
│   ├── Login.jsx        # Autenticação
│   └── Navigation.jsx   # Navegação mobile
├── hooks/               # Hooks customizados
│   └── useLocalStorage.js
├── firebase.js          # Configuração Firebase
├── App.jsx             # Componente principal
└── main.jsx            # Ponto de entrada
```

## 🎨 Paleta de Cores

- **Primary**: Tons escuros para contraste
- **Success**: Verde para vendas e lucros
- **Warning**: Amarelo para alertas de estoque
- **Danger**: Vermelho para estoque baixo
- **Info**: Azul para informações gerais

## 📊 Controle de Estoque

### Produtos
- Descrição personalizada
- Tamanhos padronizados (PP, P, M, G, GG, XG, XXG)
- Controle de quantidade
- Alertas visuais para estoque baixo

### Compras
- Seleção de produto existente
- Quantidade comprada
- Preço de custo unitário
- Data da compra
- Atualização automática do estoque

### Vendas
- Seleção de cliente
- Seleção de produto com validação de estoque
- Quantidade vendida
- Preço de venda
- Cálculo automático do total
- Redução automática do estoque

## 👥 Gestão de Clientes

- Nome completo
- WhatsApp com formatação automática
- Link direto para WhatsApp
- Validação de formato do número

## 📈 Cálculos Automáticos

- **Lucro**: (Preço de Venda - Preço de Custo Médio) × Quantidade
- **Margem**: (Lucro ÷ Vendas) × 100
- **Totais**: Soma automática por período

## 🔒 Segurança

- Autenticação obrigatória via Firebase Auth
- Regras de segurança no Firestore
- Dados isolados por usuário autenticado

## 📱 Compatibilidade

- ✅ Chrome Mobile
- ✅ Safari Mobile
- ✅ Firefox Mobile
- ✅ Edge Mobile
- ✅ Navegadores desktop (responsivo)

## 🚧 Próximas Funcionalidades (Roadmap)

- [ ] Relatórios em PDF
- [ ] Gráficos de vendas
- [ ] Backup automático
- [ ] Notificações push
- [ ] Múltiplas lojas
- [ ] Código de barras
- [ ] Integração com marketplace

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do WhatsApp dos clientes cadastrados no sistema.

---

**Desenvolvido com ❤️ para pequenos empreendedores**

