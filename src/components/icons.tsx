export function GmtLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="url(#gmt-grad)" />
      <path d="M8 20C8 13.373 13.373 8 20 8s12 5.373 12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 26l6-12 6 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.5 22h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="gmt-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316"/>
          <stop offset="0.5" stopColor="#a855f7"/>
          <stop offset="1" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#f97316" opacity="0.15"/>
      <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 12l2 2 4-4" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#4ade80" opacity="0.15"/>
      <path d="M12 4a8 8 0 1 0 0 16A8 8 0 0 0 12 4zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 12 6z" fill="#4ade80"/>
      <circle cx="12" cy="12" r="2" fill="#4ade80"/>
    </svg>
  );
}

export function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#60a5fa" opacity="0.15"/>
      <path d="M12 4L8 12l4 8 4-8-4-8z" fill="#60a5fa"/>
      <path d="M4 12h16" stroke="#60a5fa" strokeWidth="1.5"/>
    </svg>
  );
}

export function OpenRouterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#c084fc" opacity="0.15"/>
      <path d="M4 8h16M4 12h12M4 16h8" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function GroqIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#facc15" opacity="0.15"/>
      <path d="M8 8h8v8H8z" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8v8M8 12h8" stroke="#facc15" strokeWidth="1.5"/>
    </svg>
  );
}

export function FuelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L4.09 12.26a1 1 0 0 0 .74 1.7h6.17L11 22l8.91-10.26a1 1 0 0 0-.74-1.7h-6.17L13 2z" fill="currentColor"/>
    </svg>
  );
}

export function TokenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 8h4.5a2.5 2.5 0 0 1 0 5H9v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 13h5.5a2.5 2.5 0 0 1 0 5H9v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="12" y1="6" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
