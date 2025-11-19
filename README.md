# P2
Avaliação 2 - IAAS (computação em nuvem 1)

## Instância na web
- url -> [4.229.169.75](http://4.229.169.75)

## Descrição
A aplicação é um formulário para cadastro de alunos em banco MySQL, com backend separado do frontend e comunicação através de API!

## Pré-requisitos
- **Node.js**
- **Npm**
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

## 📋 Validações Implementadas

### Frontend
- ✅ Nome: mínimo 3 caracteres, máximo 100, apenas letras
- ✅ Usuário: mínimo 4 caracteres, máximo 50, alfanumérico + underscore
- ✅ Senha: mínimo 8 caracteres, deve ter maiúsculas, minúsculas e números
- ✅ Email: formato válido, máximo 255 caracteres
- ✅ Foto: máximo 5MB, apenas imagens
- ✅ Observação: máximo 500 caracteres (opcional)

### Backend
- ✅ Mesmas validações do frontend
- ✅ Verifica usuário duplicado
- ✅ Verifica email duplicado
- ✅ Hash de senha com bcrypt (12 salt rounds)
- ✅ Proteção contra SQL injection

## 🔒 Segurança da Senha

O sistema usa **bcrypt** com 12 salt rounds.
