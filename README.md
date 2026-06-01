# O Meu Dia - PWA

Uma aplicação focada em produtividade para gerir as suas Tarefas, Lembretes e Lista de Supermercado num só lugar.

## Stack Tecnológica
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui & lucide-react
- **PWA**: next-pwa
- **Armazenamento**: LocalStorage (preparado para futura migração)

## Como correr localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o browser em [http://localhost:3000](http://localhost:3000).

## Como fazer build e testar PWA (Offline)

Para que o Service Worker da PWA funcione em pleno, deve fazer build da aplicação:

1. Gere o build de produção:
   ```bash
   npm run build
   ```

2. Inicie o servidor de produção:
   ```bash
   npm run start
   ```

## Como instalar a PWA

- **Android (Chrome)**: Ao abrir a app no Chrome, irá aparecer um banner "Adicionar ao ecrã inicial", ou pode aceder ao menu (3 pontos) e selecionar "Instalar aplicação".
- **iOS (Safari)**: Abra a app no Safari, toque no ícone de Partilha (quadrado com seta para cima) e selecione "Adicionar ao ecrã principal".

## Próximos passos

Esta aplicação foi construída com abstrações preparadas para o futuro. Eis como prosseguir:

1. **Ligar ao Supabase**:
   - Atualmente, os dados são guardados em `localStorage` através do ficheiro `src/lib/storage.ts`.
   - Pode substituir os métodos `get` e `set` por chamadas à API do Supabase.
   - Os hooks (ex: `useTasks`) já utilizam um estado que pode facilmente ser adaptado para chamadas assíncronas (`async/await`).

2. **Deploy na Vercel**:
   - Faça push deste código para um repositório no GitHub.
   - Crie um novo projeto na Vercel e importe o repositório.
   - O Vercel deteta automaticamente o Next.js e fará o build e deploy sem qualquer configuração adicional necessária.
