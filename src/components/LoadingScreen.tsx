import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [stage, setStage] = useState<'show' | 'shrink' | 'complete'>('show');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/Satanas_Fidelis_Logo.png';
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!imageLoaded) return;

    const shrinkTimer = setTimeout(() => setStage('shrink'), 2500);
    const completeTimer = setTimeout(() => {
      setStage('complete');
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, imageLoaded]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 backdrop-blur-xl bg-black/90 transition-all duration-1000 ${
          stage === 'complete' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${stage === 'shrink' ? 'backdrop-blur-none bg-black/0' : ''}`}
      />

      <div
        className={`fixed z-[60] transition-all duration-[1500ms] ease-in-out ${
          stage === 'show'
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : stage === 'shrink'
            ? 'top-20 left-1/2 -translate-x-1/2 translate-y-0'
            : 'top-20 left-1/2 -translate-x-1/2 translate-y-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div
            className={`relative transition-all duration-[1500ms] ease-in-out ${
              stage === 'show' ? 'w-64 h-64' : 'w-12 h-12'
            }`}
            style={{
              filter: stage === 'show' ? 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.8))' : 'none',
            }}
          >
            {!imageError ? (
              <img
                src="/Satanas_Fidelis_Logo.png"
                alt="Satanas Fidelis"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-red-600 text-6xl font-bold">
                SF
              </div>
            )}

            {stage === 'show' && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse-glow -z-10">
                <div className="w-full h-full bg-red-600 rounded-full blur-3xl opacity-30"></div>
              </div>
            )}
          </div>

          <h1
            className={`font-bold text-white tracking-wider transition-all duration-[1500ms] ease-in-out ${
              stage === 'show' ? 'text-5xl opacity-100' : 'text-[0px] opacity-0 h-0'
            }`}
            style={{
              textShadow: '0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.6)',
              animation: stage === 'show' ? 'flameFlicker 2s ease-in-out infinite' : 'none'
            }}
          >
            SATANAS FIDELIS
          </h1>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        @keyframes flameFlicker {
          0%, 100% {
            text-shadow: 0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.6), 0 0 30px rgba(220, 38, 38, 0.4);
          }
          25% {
            text-shadow: 0 0 15px rgba(220, 38, 38, 0.9), 0 0 25px rgba(220, 38, 38, 0.7), 0 0 35px rgba(220, 38, 38, 0.5);
          }
          50% {
            text-shadow: 0 0 8px rgba(220, 38, 38, 0.7), 0 0 18px rgba(220, 38, 38, 0.5), 0 0 28px rgba(220, 38, 38, 0.3);
          }
          75% {
            text-shadow: 0 0 12px rgba(220, 38, 38, 0.85), 0 0 22px rgba(220, 38, 38, 0.65), 0 0 32px rgba(220, 38, 38, 0.45);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 1s ease-in-out;
        }
      `}</style>
    </>
  );
}
