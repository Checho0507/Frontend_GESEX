import React from "react";

interface LoadingProps {
  mensaje?: string;
}

export const Loading: React.FC<LoadingProps> = ({ mensaje = "Cargando cuestionarios..." }) => {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-pulse text-center">
        <p className="text-lg font-medium text-gray-700">{mensaje}</p>
      </div>
    </div>
  );
};

interface ErrorProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md max-w-3xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-2">Error</h2>
      <p>{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Intentar nuevamente
        </button>
      )}
    </div>
  );
};