import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * 1. Agenda Visual em Tempo Real
 * Calendário com setas de sincronização/atualização em tempo real.
 */
export function RealTimeCalendarIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-calendar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Corpo do Calendário */}
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="url(#grad-calendar)" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="url(#grad-calendar)" />
      <line x1="8" y1="2" x2="8" y2="5" stroke="url(#grad-calendar)" />
      <line x1="16" y1="2" x2="16" y2="5" stroke="url(#grad-calendar)" />
      
      {/* Grid de dias simplificado */}
      <rect x="7" y="12" width="2" height="2" rx="0.5" fill="#00D4FF" opacity="0.8" />
      <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#2563EB" opacity="0.8" />
      
      {/* Setas de atualização/real-time no canto inferior direito */}
      <path
        d="M15 16.5a2.5 2.5 0 0 1 3.5-1.5m0 0l-1-.5m1 .5l.5-1"
        stroke="#00D4FF"
        strokeWidth="1.5"
      />
      <path
        d="M19 15.5a2.5 2.5 0 0 1-3.5 1.5m0 0l1 .5m-1-.5l-.5 1"
        stroke="#2563EB"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * 2. Automação com Inteligência Artificial
 * Rede de nós interconectados com faísca de inteligência artificial.
 */
export function AutomationAiIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-ai-auto" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Conexões (linhas do fluxo) */}
      <path d="M4 12h5" stroke="url(#grad-ai-auto)" strokeDasharray="1 1" />
      <path d="M15 12h5" stroke="url(#grad-ai-auto)" strokeDasharray="1 1" />
      <path d="M12 9V4" stroke="url(#grad-ai-auto)" />
      <path d="M12 15v5" stroke="url(#grad-ai-auto)" />
      
      {/* Nós (círculos) */}
      <circle cx="4" cy="12" r="2.5" stroke="#00D4FF" fill="#0D1B3E" />
      <circle cx="20" cy="12" r="2.5" stroke="#2563EB" fill="#0D1B3E" />
      <circle cx="12" cy="4" r="2" stroke="url(#grad-ai-auto)" fill="#0D1B3E" />
      <circle cx="12" cy="20" r="2" stroke="url(#grad-ai-auto)" fill="#0D1B3E" />
      
      {/* Nó Central - Estrela de IA */}
      <path
        d="M12 8.5l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8z"
        fill="url(#grad-ai-auto)"
        stroke="url(#grad-ai-auto)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

/**
 * 3. Analytics de Performance
 * Gráfico com barras geométricas suaves e linha de tendência ascendente.
 */
export function PerformanceAnalyticsIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-analytics" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      {/* Eixos */}
      <line x1="3" y1="20" x2="21" y2="20" stroke="#2563EB" opacity="0.4" />
      <line x1="3" y1="4" x2="3" y2="20" stroke="#2563EB" opacity="0.4" />

      {/* Barras soft-geometric */}
      <rect x="6" y="12" width="3" height="8" rx="1" fill="url(#grad-analytics)" opacity="0.7" />
      <rect x="11" y="9" width="3" height="11" rx="1" fill="url(#grad-analytics)" opacity="0.85" />
      <rect x="16" y="6" width="3" height="14" rx="1" fill="url(#grad-analytics)" />

      {/* Linha de tendência brilhante */}
      <path
        d="M5 14l5-4 5 1 5-6"
        stroke="#00D4FF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="5" r="1.5" fill="#FFFFFF" stroke="#00D4FF" strokeWidth="1" />
    </svg>
  );
}

/**
 * 4. Segurança e LGPD
 * Escudo protetor com linhas geométricas e check.
 */
export function SecurityLgpdIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-security" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Escudo tecnológico */}
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="url(#grad-security)"
        fill="#0D1B3E"
        fillOpacity="0.4"
      />
      {/* Checkmark geométrico de segurança */}
      <path
        d="M9 11l2 2 4-4"
        stroke="#00D4FF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 5. Webhooks Confiáveis
 * Raio neon de alta performance cruzando conexões de dados.
 */
export function WebhooksIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-webhook" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Parênteses/Tags de código de API (< >) */}
      <path d="M6 8L2 12l4 4" stroke="#2563EB" />
      <path d="M18 8l4 4-4 4" stroke="#2563EB" />

      {/* Raio Neon central */}
      <path
        d="M13 3L8 12h5l-2 9 7-10h-5l3-8z"
        fill="url(#grad-webhook)"
        stroke="url(#grad-webhook)"
      />
    </svg>
  );
}

/**
 * 6. Responsivo e Mobile-First
 * Monitor e Smartphone integrados com visual geométrico suave.
 */
export function ResponsiveMobileIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-responsive" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Tela do Monitor */}
      <rect x="2" y="4" width="16" height="11" rx="2" stroke="url(#grad-responsive)" opacity="0.6" />
      <path d="M6 15v3" stroke="url(#grad-responsive)" opacity="0.6" />
      <path d="M10 15v3" stroke="url(#grad-responsive)" opacity="0.6" />
      <line x1="4" y1="18" x2="14" y2="18" stroke="url(#grad-responsive)" opacity="0.6" strokeWidth="1.5" />

      {/* Smartphone sobreposto */}
      <rect
        x="13"
        y="8"
        width="8"
        height="13"
        rx="2"
        stroke="url(#grad-responsive)"
        fill="#0D1B3E"
        strokeWidth="2"
      />
      <circle cx="17" cy="18.5" r="0.75" fill="#00D4FF" />
      <line x1="15" y1="10" x2="19" y2="10" stroke="#2563EB" strokeWidth="1" />
    </svg>
  );
}

/**
 * 7. Redução Drástica de Faltas (No-Shows)
 * Relógio com balão de chat (WhatsApp) e check de confirmação.
 */
export function NoShowsReductionIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-noshow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      {/* Círculo do relógio */}
      <circle cx="10" cy="11" r="7" stroke="#2563EB" opacity="0.6" />
      <path d="M10 7v4l2.5 1.5" stroke="#2563EB" opacity="0.6" />

      {/* Balão de mensagem (WhatsApp) sobreposto */}
      <path
        d="M18.5 10.5a4.5 4.5 0 0 1-5 7.5L12 20l2-1.5c1.5.5 3 0 4-1a4.5 4.5 0 0 0 .5-7z"
        fill="#0D1B3E"
        stroke="url(#grad-noshow)"
        strokeWidth="2"
      />
      {/* Check de confirmado dentro do chat */}
      <path
        d="M14.5 14.5l1 1 2-2"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 8. Atendimento e Reserva 24/7 com IA
 * Lâmpada de ideias moderna fundida com um chat e estrelas de IA (✦).
 */
export function AiAssistant247Icon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-ai" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Corpo da Lâmpada */}
      <path
        d="M9 18h6m-5 3h4m-5-9a4 4 0 1 1 6 0c0 1.5-1 2.5-1.5 3.5a1 1 0 0 1-.8.5h-1.4a1 1 0 0 1-.8-.5C10 14.5 9 13.5 9 12z"
        stroke="url(#grad-ai)"
        fill="#0D1B3E"
        fillOpacity="0.3"
      />
      
      {/* Estrelas de IA (✦) brilhantes ao redor */}
      <path
        d="M17 3.5l.3 1 .1 1-.2-1-.8-.2 1-.3m-10 1.5l.2.8.8.2-.8.2-.2.8-.2-.8-.8-.2.8-.2z"
        fill="#00D4FF"
        stroke="#00D4FF"
        strokeWidth="0.5"
      />

      {/* Filamento da lâmpada em estrela de IA */}
      <path
        d="M12 10.5l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z"
        fill="#00D4FF"
        stroke="#00D4FF"
        strokeWidth="0.5"
      />
    </svg>
  );
}

/**
 * 9. Otimização de Tempo do Prestador
 * Grade de calendário com slots otimizados e organizados.
 */
export function ProviderTimeOptimizationIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="grad-opt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Calendário Base */}
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#2563EB" opacity="0.6" />
      <line x1="3" y1="8" x2="21" y2="8" stroke="#2563EB" opacity="0.6" />

      {/* Blocos de slot de tempo ocupados / otimizados */}
      <rect x="6" y="11" width="5" height="3" rx="1" fill="url(#grad-opt)" />
      <rect x="13" y="11" width="5" height="3" rx="1" fill="#0D1B3E" stroke="#00D4FF" strokeWidth="1.5" />
      <rect x="6" y="16" width="12" height="3" rx="1" fill="url(#grad-opt)" opacity="0.8" />

      {/* Setas pequenas de encaixe/otimização */}
      <path d="M12 11h-1m1 0v1" stroke="#00D4FF" strokeWidth="1" />
    </svg>
  );
}
