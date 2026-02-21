export default function BaphometIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 10 L35 25 L30 35 L35 45 L30 55 L35 65 L40 75 L50 85 L60 75 L65 65 L70 55 L65 45 L70 35 L65 25 Z" />
      <circle cx="40" cy="40" r="4" fill="black" />
      <circle cx="60" cy="40" r="4" fill="black" />
      <path d="M30 20 L25 10 M70 20 L75 10" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
