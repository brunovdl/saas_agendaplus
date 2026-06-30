# Correção de Cálculo de Dias da Semana no Agente de IA

Este plano propõe as alterações necessárias para resolver o problema de o agente de IA errar o dia da semana das datas (por exemplo, achar que 22/06/2026 é terça-feira quando na verdade é segunda-feira). Como os modelos de linguagem (LLMs) não possuem lógica de calendário nativa, nós forneceremos uma lista explícita com os próximos 10 dias e seus respectivos dias da semana (em português) como referência no prompt.

## Proposed Changes

### Componente: n8n Workflow (`zv40A7jX8At33Tzh`)

#### [MODIFY] Nó `aggregateAgenda` (`n8n-nodes-base.code`)
Atualizar o código JavaScript para gerar uma lista com os próximos 10 dias no fuso horário do prestador, contendo a data formatada e o dia da semana em português (pt-BR).

**Novo código JavaScript proposto:**
```javascript
const prestador = $('getPrestador').first().json;
const timezone = prestador.timezone || 'America/Sao_Paulo';

// Gerar a lista de próximos 10 dias com datas e nomes dos dias da semana em pt-BR
const diasReferencia = [];
for (let i = 0; i < 10; i++) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + i);
  
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'long'
  });
  
  const dateStr = dateFormatter.format(targetDate);
  let weekdayStr = weekdayFormatter.format(targetDate);
  
  // Capitalizar primeira letra
  weekdayStr = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
  
  const label = i === 0 ? `* ${dateStr}: ${weekdayStr} (Hoje)` : `* ${dateStr}: ${weekdayStr}`;
  diasReferencia.push(label);
}

const items = $input.all();
const agendamentos = items
  .map(item => item.json)
  .filter(a => a && Object.keys(a).length > 0 && a.id !== undefined)
  .map(a => {
    const toLocalISO = (isoStr) => {
      if (!isoStr) return null;
      try {
        const date = new Date(isoStr);
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        const parts = formatter.formatToParts(date);
        const partMap = {};
        parts.forEach(p => partMap[p.type] = p.value);
        
        const formattedLocal = `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}`;
        
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const diffMs = tzDate.getTime() - utcDate.getTime();
        const diffMins = Math.round(diffMs / 60000);
        
        const sign = diffMins >= 0 ? '+' : '-';
        const absMins = Math.abs(diffMins);
        const hours = String(Math.floor(absMins / 60)).padStart(2, '0');
        const mins = String(absMins % 60).padStart(2, '0');
        const offset = `${sign}${hours}:${mins}`;
        
        return `${formattedLocal}${offset}`;
      } catch (err) {
        return isoStr;
      }
    };

    return {
      ...a,
      data_hora_inicio: toLocalISO(a.data_hora_inicio),
      data_hora_fim: toLocalISO(a.data_hora_fim)
    };
  });

return [{ json: { agendamentos, diasReferencia } }];
```

---

#### [MODIFY] Nó `aiAgent` (`@n8n/n8n-nodes-langchain.agent`)
Atualizar o prompt de sistema (`systemMessage`) para incluir a lista dinâmica de calendário gerada pelo nó anterior.

**Modificação no Prompt (Sob a seção # DADOS DO SISTEMA E DO CLIENTE):**
```text
# DADOS DO SISTEMA E DO CLIENTE
- Data e hora atual: {{ $now.setZone($('getPrestador').first().json.timezone || 'America/Sao_Paulo').toFormat('dd/MM/yyyy HH:mm') }} (Use isto como referência absoluta para "hoje").
- Fuso horário local do prestador: {{ $('getPrestador').first().json.timezone || 'America/Sao_Paulo' }} (Offset: {{ $now.setZone($('getPrestador').first().json.timezone || 'America/Sao_Paulo').toFormat('ZZ') }}).
- Calendário de referência dos próximos 10 dias (Use para saber qual data e dia da semana correspondem):
{{ $('aggregateAgenda').first().json.diasReferencia.join('\n') }}
```

---

## Verification Plan

### Manual Verification
- Testar a conversão de fuso horário e a geração das strings no nó `aggregateAgenda`.
- Verificar se o agente identifica o dia de hoje e o dia de quarta-feira de forma correta (segunda-feira e quarta-feira, respectivamente).
- Simular um agendamento e verificar se as datas geradas são as corretas.


---
← Voltar para [[Sessão - Correção de Cálculo de Dias da Semana no Agente de IA (c1c19473)]]