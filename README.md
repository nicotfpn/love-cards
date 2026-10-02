# Pokémon — coleção Full Art

Booster interativo para celular com Theo V (Normal), Salem V (Dark), Furrencio V (Psíquico) e Nicole (Trainer Full Art, tema Fada). As fotografias são as originais: apenas recorte e composição, sem redesenho por IA.

## Rodar e publicar

```sh
npm ci
npm run dev
npm run build
```

Na Vercel, importe o repositório usando Vite, build `npm run build` e saída `dist`. Não há backend, chaves ou variáveis de ambiente. O QR Code deve apontar para a URL final do deployment.

## Interação

- O pacote aparece diretamente, sem textos, mantendo as cores e a Poké Bola. Toque ou arraste o lacre para abrir.
- A cena ocupa o viewport dinâmico, respeita as áreas seguras e bloqueia rolagem, seleção de texto e zoom por gestos. A coleção também cabe na tela fixa.
- Um toque na carta avança para a próxima. Há uma janela de 280 ms para reconhecer dois toques sem avançar por engano.
- Dois toques ativam ou desativam a inspeção. Nesse modo, arraste para girar livremente, com frente, verso e inércia; arrastar não avança.
- Um toque sem arrastar também avança quando a inspeção está ativa. Cada nova carta começa de frente, com a rotação desativada.
- Não há instruções de gesto nem botões de girar/avançar na tela. Nome, tipo e número permanecem abaixo da carta.
- No teclado: Enter avança, espaço alterna inspeção, setas giram durante a inspeção e Escape restaura a frente.
- Um toque na última carta abre as miniaturas da coleção. O botão de reabrir aparece somente no final.
- Movimento reduzido desativa animações automáticas e inércia, preservando o giro manual.

## Editar textos e imagens

Dados em `src/data/cards.json`; originais em `public/assets/photos`. O efeito de Nicole está vazio para receber o texto do autor. Não há mensagens românticas prontas na interface. Os ataques dos pets continuam editáveis no JSON.

Após editar, instale Pillow em Python e execute:

```sh
python scripts/render_cards.py
```

O script exporta PNG e WebP em `public/assets/cards` e a folha de revisão `docs/cards-preview.jpg`. Os templates V e Trainer mantêm os rótulos ingleses originais; os ataques estão em português.

## Referências e créditos

As molduras Full Art **Sword & Shield V / Supporter**, fontes e símbolos vêm de [karl/pokecardmaker.net](https://github.com/karl/pokecardmaker.net), com templates de aschefield101. Os créditos presentes nas molduras foram preservados. O [guia Pokémon Aaah](https://www.pokemonaaah.net/customcard/blanks/) reúne autores e geradores de templates, inclusive Scarlet & Violet. Esta versão usa V, não pretende reproduzir um template ex de Scarlet & Violet.

O verso vem do [site oficial Pokémon TCG](https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg). Pokémon e suas marcas pertencem aos respectivos titulares; esta é uma coleção personalizada de fã. Fotografias fornecidas pelo autor.

O código de rotação e foil é próprio. Referência visual: [Pokémon Cards CSS, Simon Goellner](https://github.com/simeydotme/pokemon-cards-css). As bordas PocketCards usadas na versão anterior permanecem no histórico, mas não são usadas no novo renderizador.

## Verificação

Build de produção com Vite. Gestos verificados em Chromium mobile: toque simples avança, toque duplo mantém a carta e ativa inspeção, arraste gira além de 180° sem avançar, próxima carta restaura a frente, coleção e replay funcionam. Bloqueio de rolagem e zoom previamente verificado em três tamanhos de tela. Safari em iPhone ainda precisa de teste em aparelho real.
