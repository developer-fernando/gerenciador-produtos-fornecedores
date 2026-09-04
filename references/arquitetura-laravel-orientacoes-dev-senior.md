# Arquitetura Laravel — Orientações do Desenvolvedor Sênior (material de referência)

> **Natureza deste documento:** transcrição/consolidação **fiel** das orientações fornecidas por um desenvolvedor PHP/Laravel Sênior sobre a arquitetura do back-end.
>
> É **material de referência**, não decisão de projeto. Não contém análise, validação nem conclusões. Parte destas recomendações poderá ser adotada e parte descartada conforme o contexto da aplicação, em etapa posterior. Informações de segurança e performance ainda serão fornecidas separadamente.

---

## Camadas Service e Repository

- A aplicação terá uma camada de **Service** e uma de **Repository**.
- **Service:** camada que faz todo o trabalho que **não** envolve banco de dados.
  - Exemplo: gerar um PDF na aplicação. Isso não envolve banco de dados, mas os dados que vão para o PDF estão no banco.
  - Quem **gera o PDF** é a camada de **Service**; quem **recupera os dados** é a camada de **Repository**.
- A **união das duas camadas** é feita no próprio **Service**. Quando se quer recuperar um dado, chama-se a classe do Repository.
  - Exemplo: existe o `UserRepository` (uma classe). Deseja-se fazer um `get fresh`, primeiro usuário. Pegam-se do Repository os dados relacionados ao usuário, e isso pode ser feito dentro da própria camada de Service.
  - Observação: o Service está gerando o PDF e simplesmente inserindo nele o que outra camada (Repository) está fazendo.
- A arquitetura simples de back-end é o **MVC**, que é o padrão Laravel, com uma camada de **Service** e **Repository**.

## Camadas Request e DTO

- Outras camadas importantes são as de **Request** e **DTO**.
- A ideia das camadas de Request e DTO é fazer a **padronização dos objetos**.
  - Em qualquer lugar da aplicação, sempre que alguém queira usar um objeto de usuário, ele sempre terá exatamente o mesmo objeto, com os mesmos campos, valores, o mesmo nome de atributos e as mesmas regras de validação.
  - Essas duas camadas tratam essa padronização.
- **DTO** é todo objeto da aplicação, e **todo objeto da aplicação precisa ser mapeado**.

## União das camadas

- A união de **Service**, **Repository**, **Request** e **DTO** entra no **Controller**.
- Fluxo comum da requisição: a **rota** é definida; depois essa rota manda para um **Controller**.
- Esse Controller **não** será responsável por:
  - fazer validação de campo;
  - chamar método para inserir no banco;
  - concentrar essas responsabilidades.
- Quando uma rota for criada e passar para um Controller, esse Controller vai simplesmente **chamar as chamadas de responsabilidade**.
- A ideia é que **cada responsabilidade esteja em sua camada correspondente**.

## Fluxo de uma requisição

- O fluxo funciona a partir da **rota**.
- A rota é definida e direciona a requisição para um **Controller**.
- O Controller é responsável por **orquestrar as chamadas** necessárias, utilizando as camadas responsáveis por cada operação.
- O Controller **não deve concentrar** regras ou responsabilidades que pertencem às outras camadas.

## Exemplo — Geração de relatório de usuário

Considerando uma rota responsável por gerar o relatório de usuário:

- Para gerar o relatório, há um serviço de geração de PDF. A **geração do PDF pertence à camada Service**.
- Há os dados que serão utilizados no relatório. **Se é dado, é Repository**, pois os dados estão relacionados ao banco de dados.

No **Controller**:

1. Chama-se o **Repository** para recuperar os dados do banco;
2. O Repository retorna os dados;
3. Os dados recuperados são passados como **parâmetro para o Service**;
4. O **Service** realiza a geração do PDF;
5. O Service recebe os dados necessários para realizar sua responsabilidade.

- Exemplo: no Controller chama-se o Service `generatePDF`.
- O parâmetro passado para o `generatePDF` é o usuário que já foi recuperado anteriormente pelo Repository.
- Também existe um **parâmetro de erro** para saber se a geração do PDF apresentou algum erro ou não.
- Nesse cenário, o Controller terá aproximadamente **3 ou 4 linhas**, pois sua responsabilidade é apenas coordenar as chamadas entre as camadas.

## Fluxo conceitual apresentado

O fluxo apresentado pode ser representado conceitualmente como:

```
Route → Controller → Repository → Controller → Service
```

Onde:

- **Route:** recebe/direciona a requisição;
- **Controller:** coordena as chamadas;
- **Repository:** recupera ou manipula dados relacionados ao banco;
- **Service:** executa a lógica ou operação que não pertence à camada de acesso aos dados;
- **Request:** trata a padronização/validação das entradas;
- **DTO:** padroniza e representa os objetos utilizados pela aplicação.

---

> Estas informações representam a explicação fornecida pelo desenvolvedor Sênior e fazem parte do material de referência sobre a arquitetura Laravel que será utilizado nas próximas etapas.
