export default function InvertedPentagram({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M50 95 L35 60 L2 60 L30 40 L18 5 L50 28 L82 5 L70 40 L98 60 L65 60 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
