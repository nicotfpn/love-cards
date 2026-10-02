# Paixão — uma edição só tua

Revista de aniversário mobile-first para Nicole, com papel creme, títulos em vinho, fotografias coladas, um bilhete, uma entrevista respondida pelo namorado e uma página de Salem, Furrencio e Theo. No final, o botão **Booster edição especial** abre o pacote de cartas Full Art em tela cheia.

## Rodar e publicar

```sh
npm ci
npm run dev
npm run build
```

Vercel: framework Vite, build `npm run build`, saída `dist`. O QR Code continua apontando para a mesma URL. Sem backend ou variáveis de ambiente.

## A revista

A revista permite rolagem vertical. As composições aparecem uma vez ao entrar na tela; movimento reduzido mostra tudo imediatamente. As páginas usam as fotografias originais já existentes no projeto. As novas fotografias do casal, os recortes de silhueta e as respectivas cartas ainda dependem do envio dessas imagens pelo autor.

Textos e fotografias ficam em `src/data/magazine.json`. `moments` começa vazio para não exibir fotos fictícias nem espaços de preenchimento. Cada entrada aceita:

```json
{
  "src": "/assets/photos/nos-recortados.webp",
  "alt": "Descrição da fotografia",
  "note": "Frase do autor",
  "cutout": true
}
```

`cutout: true` aplica uma borda de papel à imagem com transparência já preparada; não remove o fundo automaticamente. Para fotos inteiras, omita `cutout` e use `position` para ajustar o enquadramento. As fotos originais não são redesenhadas.

## O booster

- O pacote mantém as cores e a Poké Bola, sem textos estampados.
- A cena respeita as áreas seguras e bloqueia rolagem e gestos de zoom apenas enquanto está aberta. O × ou Escape retorna à revista no ponto de leitura.
- Um toque avança. Dois toques ativam ou desativam a rotação livre; arrastar nesse modo gira sem avançar. Cada carta nova começa de frente.
- No teclado: Enter avança, espaço alterna inspeção e setas giram. Escape fecha a cena.
- A última carta abre as miniaturas da coleção e o botão de reabrir. O número de cartas e a última posição são calculados pelos dados, sem limite de quatro.
- Fechar durante uma animação cancela a sessão anterior; reabrir começa com o pacote lacrado.

Dados das cartas: `src/data/cards.json`. Fotos: `public/assets/photos`. Artes: `public/assets/cards`. Cada carta pode usar `image` com o caminho de uma arte personalizada; sem esse campo, usa `/assets/cards/{id}.webp`.

Para renderizar os templates existentes, com Pillow instalado:

```sh
python scripts/render_cards.py
```

## Referências e créditos

As molduras Full Art **Sword & Shield V / Supporter**, fontes e símbolos vêm de [karl/pokecardmaker.net](https://github.com/karl/pokecardmaker.net), com templates de aschefield101. Os créditos presentes nas molduras foram preservados. O [guia Pokémon Aaah](https://www.pokemonaaah.net/customcard/blanks/) reúne autores e geradores de templates, inclusive Scarlet & Violet. Esta versão usa V, não pretende reproduzir um template ex de Scarlet & Violet.

O verso vem do [site oficial Pokémon TCG](https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg). Pokémon e suas marcas pertencem aos respectivos titulares; esta é uma coleção personalizada de fã. Fotografias fornecidas pelo autor.

O código de rotação e foil é próprio. Referência visual: [Pokémon Cards CSS, Simon Goellner](https://github.com/simeydotme/pokemon-cards-css). As bordas PocketCards usadas na versão anterior permanecem no histórico, mas não são usadas no novo renderizador.

## Verificação

Build de produção com Vite e revisão visual em Chromium mobile. Rolagem e largura verificadas em 320, 390, 430, 844 e 1280 pixels. Toque simples, toque duplo, coleção, replay, retorno à revista e cancelamento durante abertura conferidos. Safari em aparelho real ainda precisa de teste.
