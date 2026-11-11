# API WALK TALK — v1

Base: `/api/v1`. As respostas são JSON, exceto CSV. Todas as rotas exigem identidade autenticada pela hospedagem Sites. As rotas de sessão, criação da empresa e aceitação de convite podem ser usadas antes de existir associação a uma empresa.

Corpos de escrita são `application/json`. Em navegadores, a origem deve corresponder à origem da API. Não se envia `role`, `workspaceId` ou identidade no cliente para obter acesso: permissões vêm da associação armazenada no servidor.

| Método e caminho | Finalidade | Permissão |
| --- | --- | --- |
| GET /session | Usuário, perfil e empresa atual (ou null) | Autenticado |
| POST /workspace | Cria empresa com `{name, withExamples?: boolean}` | Autenticado ainda sem empresa |
| GET /overview | Métricas e atividade autorizadas | Membro |
| GET /teams | Equipes autorizadas | Membro |
| POST /teams | Cria `{name, location, color}` | Admin/gestor |
| GET /members | Lista pessoas autorizadas | Membro |
| PATCH /members/:id | Altera `{role, teamId}` de não administrador | Admin |
| GET /devices | Lista equipamentos ativos autorizados | Membro |
| POST /devices | Cadastra equipamento | Admin/gestor |
| PATCH /devices/:id | Edita campos permitidos do equipamento | Admin/gestor |
| DELETE /devices/:id | Arquiva equipamento | Admin/gestor |
| POST /devices/:id/check | Registra conferência manual | Admin/gestor ou responsável atribuído |
| GET /messages | Últimas mensagens do canal geral | Membro |
| GET /messages?teamId=… | Mensagens do canal de equipe autorizado | Membro autorizado ao canal |
| POST /messages | Publica `{body, teamId: string ou null}` | Membro autorizado ao canal |
| GET /invitations | Lista convites sem tokens ou hashes | Admin |
| POST /invitations | Cria `{role, email?, teamId?}` | Admin |
| DELETE /invitations/:id | Revoga convite pendente | Admin |
| POST /invitations/accept | Aceita `{token}` | Autenticado ainda sem empresa |
| GET /export/devices | Download CSV do inventário autorizado | Admin/gestor |

## Equipamentos

```json
{
  "name": "Rádio da base",
  "serial": "WT-001",
  "model": "WALK TALK",
  "status": "available",
  "teamId": null,
  "assignedTo": null,
  "notes": "Conferir antes da saída."
}
```

Status: `available`, `in_use` ou `maintenance`. Observações têm limite de 500 caracteres. Uma mensagem tem limite de 2.000 caracteres. Validações adicionais de comprimento estão no handler do servidor e nos formulários.

Coleções retornam `{devices}`, `{teams}`, `{members}`, `{messages}` ou `{invitations}`. Mutações de entidades retornam `{device}`, `{team}`, `{member}` ou `{message}`. Criação de convite retorna `{invitation, token, url, expiresAt}`; copie a URL nesse momento, porque listagens posteriores não recuperam o token bruto.

## Erros

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Mensagem legível para o usuário."
  }
}
```

O código efetivo varia conforme a validação. Status usuais: 400 dados inválidos, 401 identidade ausente, 403 operação não autorizada, 404 recurso não acessível, 409 conflito/estado alterado, 410 convite expirado/revogado, 413 corpo grande, 415 conteúdo incompatível, 500 falha interna. O cliente preserva os valores do formulário quando há erro.

## Desenvolvimento e testes

`npm run dev` oferece somente o mock de login local do plugin oficial. O modo compilado `npm start` permite os testes locais de múltiplas identidades por cabeçalho. Isso é uma capacidade de emulação, não uma autenticação para expor na internet. Na hospedagem Sites, os cabeçalhos são gerenciados pela plataforma. Não copie os cabeçalhos de teste para um mecanismo de login público.

Não há endpoints de saúde, sintomas, diagnósticos ou tratamentos.
