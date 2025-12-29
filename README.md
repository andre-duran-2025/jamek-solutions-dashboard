# JAMEK Solutions Dashboard v4.1

Este projeto é uma versão modernizada do dashboard de controle industrial, migrado para Vue 3 + Vite para melhor escalabilidade, manutenibilidade e performance. Agora inclui suporte completo a PWA (Progressive Web App).

## 🚀 Tecnologias

-   **Vue 3**: Framework JavaScript progressivo (Composition API).
-   **Vite**: Build tool de nova geração, extremamente rápido.
-   **PWA**: Suporte offline, instalação e cache inteligente.
-   **CSS Variables**: Para theming e fácil customização.
-   **WebSocket**: Comunicação em tempo real com Node-RED.

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

Para iniciar o servidor de desenvolvimento local:

```bash
npm run dev
```

## 📱 PWA (Progressive Web App)

A aplicação é totalmente compatível com PWA, permitindo:
-   **Instalação**: Pode ser adicionada à tela inicial (Desktop/Mobile).
-   **Offline**: Carrega a interface mesmo sem internet (cache de assets).
-   **Performance**: Carregamento instantâneo em visitas subsequentes.

### Arquivos Importantes
-   `public/manifest.webmanifest`: Metadados da aplicação (ícones, cores).
-   `public/sw.js`: Service Worker (gerencia cache e requisições).
-   `src/pwa/register-sw.js`: Lógica de registro do SW.

### Ícones
Para o PWA funcionar corretamente, adicione os seguintes ícones na pasta `public/`:
-   `pwa-192x192.png`
-   `pwa-512x512.png`
-   `pwa-maskable-192x192.png`
-   `pwa-maskable-512x512.png`

## 🏗️ Build e Deploy

Para gerar a versão de produção (otimizada):

```bash
npm run build
```

Os arquivos gerados estarão na pasta `dist`.

### Deploy na Vercel

Este projeto está pronto para deploy na Vercel.

1.  Conecte seu repositório Git (GitHub) à Vercel.
2.  O deploy será automático (detecta Vite).
3.  Certifique-se de que a variável de ambiente (se houver) esteja configurada.

## 🧪 Testes

O projeto utiliza **Vitest** para testes unitários.

```bash
npm test
```

## 📂 Estrutura do Projeto

-   `src/components`: Componentes de UI reutilizáveis (Cards, Header, Controles).
-   `src/composables`: Lógica de negócios e estado (WebSocket, Config, Toast).
-   `src/pwa`: Configurações de PWA.
-   `src/tests`: Testes automatizados.
-   `src/App.vue`: Layout principal.
-   `src/style.css`: Estilos globais.
