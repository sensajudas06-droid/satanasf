interface LuciferSigilProps {
  className?: string;
}

export default function LuciferSigil({ className = '' }: LuciferSigilProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(100, 100)">
        <circle cx="0" cy="0" r="90" fill="none" stroke="currentColor" strokeWidth="2" />

        <line x1="0" y1="-90" x2="0" y2="90" stroke="currentColor" strokeWidth="2" />
        <line x1="-90" y1="0" x2="90" y2="0" stroke="currentColor" strokeWidth="2" />

        <path
          d="M 0,-70 L 20,-50 L 0,-30 L -20,-50 Z"
          fill="currentColor"
        />

        <path
          d="M 0,30 L 15,50 L 0,70 L -15,50 Z"
          fill="currentColor"
        />

        <path
          d="M -50,-20 L -30,-10 L -50,10 L -70,0 Z"
          fill="currentColor"
        />

        <path
          d="M 50,-20 L 70,0 L 50,10 L 30,-10 Z"
          fill="currentColor"
        />

        <circle cx="0" cy="-50" r="8" fill="currentColor" />
        <circle cx="0" cy="50" r="8" fill="currentColor" />
        <circle cx="-50" cy="0" r="8" fill="currentColor" />
        <circle cx="50" cy="0" r="8" fill="currentColor" />

        <path
          d="M 0,-90 L 30,-60 M 0,-90 L -30,-60"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />

        <path
          d="M 0,90 L 25,65 M 0,90 L -25,65"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />

        <circle cx="0" cy="0" r="15" fill="currentColor" />
        <circle cx="0" cy="0" r="8" fill="black" />

        <path
          d="M -60,-60 L -40,-40 M 60,-60 L 40,-40 M -60,60 L -40,40 M 60,60 L 40,40"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
