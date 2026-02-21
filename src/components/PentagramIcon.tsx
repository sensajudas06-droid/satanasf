export default function PentagramIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" />
      <path
        d="M50 5 L65 40 L98 40 L70 60 L82 95 L50 72 L18 95 L30 60 L2 40 L35 40 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
