---
name: security-auditor
description: Utilize esta skill para avaliar e auditar a segurança do seu SaaS.
---

# Auditor de Segurança SaaS

## Quando utilizar:
- Avaliar vulnerabilidades em endpoints, APIs e autenticação.
- Auditar o código-fonte em busca de práticas inseguras.
- Realizar simulações de ataques baseados no OWASP Top 10.
- Analisar a segurança de integrações com gateways de pagamento ou bancos de dados.

## Regras e Restrições:
1. Sempre verifique se existem chaves de API expostas ou credenciais hardcoded.
2. Ao auditar o código do SaaS, identifique falhas de autenticação, injeção de SQL e falhas de controle de acesso.
3. Não modifique a base de código sem a minha autorização explícita.
4. Gere relatórios detalhados contendo o risco (Alto/Médio/Baixo) e a recomendação de correção.

## Comandos que você pode usar:
- Use ferramentas de análise estática do terminal.
- Leia o arquivo `.env.example` e documentações de configuração para entender o modelo de ameaças.

---
← Voltar para [[Cerebro-IA]]