import InvertedPentagram from './InvertedPentagram';

export default function OccultDivider() {
  return (
    <div className="flex items-center justify-center my-8">
      <div className="h-px bg-gradient-to-r from-transparent via-red-900 to-transparent w-full max-w-xs" />
      <div className="mx-4 flex items-center space-x-2">
        <InvertedPentagram className="w-4 h-4 text-red-600" />
        <InvertedPentagram className="w-6 h-6 text-red-600" />
        <InvertedPentagram className="w-4 h-4 text-red-600" />
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-red-900 to-transparent w-full max-w-xs" />
    </div>
  );
}
