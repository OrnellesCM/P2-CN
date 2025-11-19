# P2
Avaliação 2 IAAS (computação em nuvem 1) - P2CN1

## Descrição
A aplicação é um formulário para cadastro de alunos, back e front separados, comunicação por API!

## Pré-requisitos
- **Nodejs**
- **NPM**
- **Servidor MySQL**
- **Navegador web**

## Procedimentos
- Faça o download dos arquivos disponíveis neste repositório!
- Instale as dependências: rode "npm install" na raiz do projeto e na pasta "backend"!
- Configure a varíavel de ambiente com as informações do banco de dados em /backend >> .env!
- Execute o backend em /backend >> server.js: "node server.js" ou "npm run dev"!
- Execute o frontend em /: "npm run dev"!
- Utilize um navegador web para acesso a aplicação (ip do servidor:porta)!
- Explore as funcionalidades!

## API
Criar novo Aluno -> POST servidor:porta/api/alunos  
Campos:
- nome_completo (string, obrigatório)
- usuario_acesso (string, obrigatório, único)
- senha (string, obrigatório)
- email_aluno (string, obrigatório, único)
- observacao (string, opcional)
- foto (file, opcional, máx 5MB)

Listar todos os alunos -> GET /api/alunos  
Buscar aluno por ID -> GET /api/alunos/:id

## Instância na web
- url -> 
