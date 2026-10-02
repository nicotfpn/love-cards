# Uma coleção só nossa

Uma surpresa mobile com um booster flutuante e quatro cartas: Theo ex (Normal), Salem ex (Dark), Furrencio ex (Psíquico) e Nicole (Treinadora com tema Fada).

As cartas usam **as fotografias originais**, recortadas sob bordas Full Art de Pokémon TCG Pocket, adaptadas com textos em português. Nenhuma fotografia foi redesenhada por IA. Ataques, símbolos e efeitos são compostos em camadas. Nicole usa a borda Full Art com layout de Treinadora/Apoiadora e tem o efeito especial Amor Infinito em vez de ataques de Pokémon.

## Rodar

```sh
npm ci
npm run dev
```

## Publicar na Vercel

Importe este repositório, selecione Vite, comando `npm run build` e diretório de saída `dist`. Não há backend, chaves ou variáveis de ambiente. O QR Code deve apontar para a URL final do deployment.

## Interação

- Toque no pacote ou arraste o lacre para abrir.
- Arraste sobre a carta para inclinar e movimentar reflexo e foil.
- Use Próxima carta para avançar. Nicole é a quarta revelação.
- Depois da última, veja a coleção e reveja qualquer carta.
- Movimento do celular é opcional, com permissão quando exigida. O toque funciona sem sensores.
- Respeita `prefers-reduced-motion`, teclado e áreas seguras do celular.

## Editar as cartas

Dados em `src/data/cards.json`; originais em `public/assets/photos`. As imagens exportadas ficam em `public/assets/cards`. Para renderizar novamente, instale Pillow em um ambiente Python e execute:

```sh
python scripts/render_cards.py
```

`docs/cards-preview.jpg` mostra as quatro exportações. A imagem de cada carta é PNG para edição/compartilhamento e WebP para o site.

## Créditos

Bordas Full Art e EX Full Art provenientes do [gerador PocketCards](https://pocketcards.net/card-maker), adaptadas para esta coleção pessoal de fã. Símbolos, fontes e templates anteriores provenientes de [karl/pokecardmaker.net](https://github.com/karl/pokecardmaker.net). As cartas são montagens personalizadas; não são cartas oficiais nem reprodução exata de uma expansão física. A borda é do estilo Pocket e o layout de texto segue convenções de Pokémon ex/Treinadora. Pokémon e as marcas correspondentes pertencem aos seus respectivos titulares. Fotografias fornecidas pelo autor da surpresa.

O comportamento holográfico foi escrito para este projeto, com referência visual ao [Pokémon Cards CSS de Simon Goellner](https://github.com/simeydotme/pokemon-cards-css). Não copiamos código desse projeto.
