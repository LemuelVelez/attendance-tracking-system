"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/ssglogo.jpg";
    img.onload = () => {
      // Increase the timeout to 3 seconds (3000 milliseconds)
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    };
    img.onerror = () => {
      setError("Failed to load the image. Please check the file path.");
      setIsLoading(false);
    };
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-800">
      {isLoading ? (
        <div className="relative">
          <Loader2 className="w-32 h-32 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full overflow-hidden">
              <Image
                src="/ssglogo.jpg"
                alt="SSG Logo"
                width={90}
                height={90}
              />
            </div>
          </div>
        </div>
      ) : error ? (
        <p className="text-lg font-semibold text-red-500" role="alert">
          {error}
        </p>
      ) : (
        <div className="rounded-full overflow-hidden">
          <Image src="/ssglogo.jpg" alt="SSG Logo" width={200} height={200} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
