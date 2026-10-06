export function AxonLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} transition-transform hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="axonGradientReact"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFD147" />
          <stop offset="45%" stopColor="#FF6B4A" />
          <stop offset="100%" stopColor="#FF2A85" />
        </linearGradient>
      </defs>

      <path
        d="M 24 72 C 22 52, 34 26, 50 26 C 66 26, 78 52, 76 72 C 75 80, 64 80, 64 72 C 65 60, 58 42, 50 42 C 42 42, 35 60, 36 72 C 37 80, 25 80, 24 72 Z"
        fill="url(#axonGradientReact)"
      />
      <circle cx="50" cy="58" r="7" fill="url(#axonGradientReact)" />
    </svg>
  );
}
