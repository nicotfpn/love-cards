# Paixão

Presente de aniversário mobile-first: papel creme, títulos em vinho e seis fotografias originais, com recortes apenas nos dois retratos individuais. O texto de Nico aparece entre as fotografias, com pontuação revisada e assinatura no final. Os pets aparecem exclusivamente no booster.

## Rodar e publicar

```sh
npm ci
npm run dev
npm run build
```

Vercel: framework Vite, build `npm run build`, saída `dist`. O QR Code continua apontando para a mesma URL. Sem backend ou variáveis de ambiente.

## Composição e conteúdo

Fotos alternam entre os cantos, com texto ao lado. O fundo usa uma textura SVG de papel. O próprio booster flutuante no rodapé abre a cena em tela cheia.

A revista rola normalmente. As fotografias ficam visíveis desde o início, sem animações de entrada, observadores de rolagem ou efeitos de parallax. Os contornos foram traçados à mão em SVG e aplicados às fotografias por clip-path: os pixels das fotos e os rostos não são redesenhados.

As seis imagens ficam em `public/assets/photos/momento-1362.jpeg` até `momento-1367.jpeg`. Capa e colagens usam `src/data/magazine.json`; contornos usam `src/data/cutouts.json`. O campo `note` de cada fotografia contém somente o texto fornecido por Nico. Campos vazios não produzem legendas nem espaços reservados.

## Booster

A coleção tem dez cartas: Theo, Salem, Furrencio, as seis fotos novas e Nicole treinadora com cabelo rosa. As novas cartas combinam a fotografia original com a moldura Trainer já usada no projeto em HTML/CSS. Todas as seis fotos novas usam enquadramento integral dentro da área livre da moldura, sem cortes ou sobreposição dos rótulos. A última carta da Nicole de cabelo rosa tem foil animado, passagem de luz ao revelar e pequenos brilhos; movimento reduzido desliga esses efeitos.

- Toque no pacote para abrir.
- Um toque na carta avança; dois toques alternam o giro livre. Arrastar no giro não avança.
- No teclado, Enter avança, espaço alterna inspeção e setas giram.
- A última carta abre a coleção com miniaturas e replay. As miniaturas permitem rolagem horizontal.
- O × ou Escape fecha a cena e restaura o ponto de leitura da revista.
- A cena bloqueia rolagem e zoom apenas enquanto está aberta; respeita áreas seguras e movimento reduzido.

Dados em `src/data/cards.json`. `photoCard: true` usa composição em HTML/CSS; `image` aponta para a foto original, `position` ajusta o enquadramento e `layout: wide` preserva a foto horizontal. As outras cartas usam as artes de `public/assets/cards`.

O script `python scripts/render_cards.py` (Pillow) renderiza somente os templates em raster e sua folha de revisão; as cartas em CSS são conferidas no navegador.

## Referências e créditos

As molduras Full Art **Sword & Shield V / Supporter**, fontes e símbolos vêm de [karl/pokecardmaker.net](https://github.com/karl/pokecardmaker.net), com templates de aschefield101. Os créditos presentes nas molduras foram preservados. O [guia Pokémon Aaah](https://www.pokemonaaah.net/customcard/blanks/) reúne autores e geradores de templates, inclusive Scarlet & Violet. Esta versão usa V, não pretende reproduzir um template ex de Scarlet & Violet.

O verso vem do [site oficial Pokémon TCG](https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg). Pokémon e suas marcas pertencem aos respectivos titulares; esta é uma coleção personalizada de fã. Fotografias fornecidas pelo autor.

O código de rotação e foil é próprio. Referência visual: [Pokémon Cards CSS, Simon Goellner](https://github.com/simeydotme/pokemon-cards-css). As bordas PocketCards usadas na versão anterior permanecem no histórico, mas não são usadas no novo renderizador.

## Verificação

Build de produção e revisão visual em Chromium mobile. As dez cartas e a coleção foram percorridas. Sem erros de console ou assets ausentes. Largura conferida em 320, 390, 430, 844 e 1280 pixels. Safari em aparelho real ainda precisa de teste.
