# bth-conexao



<!-- Auto Generated Below -->


## Events

| Event                | Description                                                               | Type                                   |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| `bannerAtualizado`   | É emitido para exibir o banner quando estiver sem conexão com a internet. | `CustomEvent<BannerAtualizadoEvent>`   |
| `conteudoSinalizado` | É emitido quando houver alteracões na conexão com a internet              | `CustomEvent<ConteudoSinalizadoEvent>` |


## Dependencies

### Depends on

- [bth-menu-ferramenta](../../app/menu-ferramenta)
- [bth-icone](../../comuns/icone)

### Graph
```mermaid
graph TD;
  bth-conexao --> bth-menu-ferramenta
  bth-conexao --> bth-icone
  bth-menu-ferramenta --> bth-menu-painel-lateral
  bth-menu-painel-lateral --> bth-icone
  style bth-conexao fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Esta documentação é gerada automáticamente pelo StencilJS =)
