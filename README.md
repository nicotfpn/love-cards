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
- Arraste a carta em qualquer direção para girar continuamente em X e Y, inclusive mostrar o verso. Um movimento horizontal da largura da carta equivale a uma volta completa.
- Ao soltar, há uma pequena desaceleração; a carta permanece na posição escolhida. Segurar antes de soltar evita a inércia.
- Virar alterna frente/verso; Centralizar restaura a frente. As setas do teclado também giram a carta.
- Foil e reflexo respondem à orientação. Movimento do celular é opcional e depende de suporte e permissão do navegador; o arraste funciona sozinho.
- Próxima carta avança até Nicole. No fim, as miniaturas permitem rever as quatro cartas e abrir o pacote novamente.
- Movimento reduzido desativa as animações automáticas e a inércia, preservando a rotação manual.

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

Build de produção com Vite. Fluxo verificado em Chromium com viewports 390×844, 320×568 e 844×390: abertura, quatro revelações, arraste touch além de 250°, frente/verso, centralização, coleção e replay. Rotação por teclado também verificada com movimento reduzido. Sensores físicos e Safari em iPhone ainda precisam de teste em aparelhos reais.
