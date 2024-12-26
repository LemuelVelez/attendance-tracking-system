/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrReader } from "react-qr-reader";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, Upload, Loader2 } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onCancel: () => void;
  resetScanner: () => void;
}

type ScanMode = "camera" | "image" | null;

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onCancel,
  resetScanner,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setError(null);
  }, [scanMode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = async (result: any) => {
    if (result) {
      onScan(result.text);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetScanner();
      setIsLoading(true);
      setScanMode("image");
      const reader = new FileReader();
      reader.onload = async (e) => {
        setUploadedImage(e.target?.result as string);
        setIsScanning(true);
        try {
          const img = new Image();
          img.src = e.target?.result as string;
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx?.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          if (imageData) {
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );
            if (code) {
              onScan(code.data);
            } else {
              setError(
                "No QR code found in the image. Please try again with a clear image of a QR code."
              );
            }
          }
        } catch (error) {
          console.error("Error processing image:", error);
          setError(
            "Failed to process the image. Please try again with a different image."
          );
        } finally {
          setIsScanning(false);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const ScanningAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full relative overflow-hidden">
        <motion.div
          className="w-full h-1 bg-primary absolute left-0"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {scanMode ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div className="relative">
                {scanMode === "camera" ? (
                  <QrReader
                    onResult={handleScan}
                    constraints={{ facingMode: "environment" }}
                    videoId="qr-reader-video"
                    scanDelay={300}
                    containerStyle={{ width: "100%" }}
                    videoStyle={{ width: "100%" }}
                  />
                ) : uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded QR Code"
                    className="w-full"
                  />
                ) : null}
                {!isScanning && <ScanningAnimation />}
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">
                {scanMode === "camera"
                  ? "Align QR code within the frame"
                  : isScanning
                  ? "Scanning uploaded image..."
                  : "Processing uploaded image..."}
              </p>
              <Button
                onClick={() => {
                  onCancel();
                  resetScanner();
                }}
                className="w-full mt-4 bg-secondary hover:bg-secondary/90 transition-all duration-300"
              >
                Cancel
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Button
                onClick={() => setScanMode("camera")}
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan with Camera
              </Button>
              <div className="relative">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload QR Code Image
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
