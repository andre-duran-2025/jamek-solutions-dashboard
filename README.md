# JAMEK Solutions Dashboard v4.1

Este projeto é uma versão modernizada do dashboard de controle industrial, migrado para Vue 3 + Vite para melhor escalabilidade, manutenibilidade e performance.

## 🚀 Tecnologias

-   **Vue 3**: Framework JavaScript progressivo (Composition API).
-   **Vite**: Build tool de nova geração, extremamente rápido.
-   **CSS Variables**: Para theming e fácil customização.
-   **WebSocket**: Comunicação em tempo real com Node-RED/ESP32.

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

Para iniciar o servidor de desenvolvimento local:

```bash
npm run dev
```

## 🏗️ Build e Deploy

Para gerar a versão de produção (otimizada):

```bash
npm run build
```

Os arquivos gerados estarão na pasta `dist`.

### Deploy na Vercel

Este projeto está pronto para deploy na Vercel.

1.  Instale a Vercel CLI: `npm i -g vercel`
2.  Execute `vercel` na raiz do projeto.
3.  Siga as instruções (aceite os defaults).

Ou conecte seu repositório Git (GitHub/GitLab) à Vercel e o deploy será automático.

## 📂 Estrutura do Projeto

-   `src/components`: Componentes de UI reutilizáveis (Cards, Header, Controles).
-   `src/composables`: Lógica de negócios e estado (WebSocket, Config, Toast).
-   `src/App.vue`: Layout principal.
-   `src/style.css`: Estilos globais.
