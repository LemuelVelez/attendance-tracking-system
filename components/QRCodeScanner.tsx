"use client";

import React, { useState, useRef, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Camera } from "lucide-react";
import {
  createGeneralAttendance,
  EventData,
} from "@/lib/attendance/attendance";
import jsQR from "jsqr";
import { ResultDialog } from "./SuccessDialog";

type ScanMode = "camera" | "image" | null;

export default function QRCodeScanner() {
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    setError(null);
  }, [scanMode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = async (result: any) => {
    if (result) {
      await processQRCode(result.text);
    }
  };

  const processQRCode = async (data: string) => {
    try {
      setIsLoading(true);

      // Validate QR code data
      let eventData: EventData;
      try {
        eventData = JSON.parse(data);
        if (
          !eventData.eventName ||
          !eventData.location ||
          !eventData.date ||
          !eventData.day ||
          !eventData.time
        ) {
          throw new Error("Invalid QR code data: missing required fields");
        }
      } catch (parseError) {
        console.error("Error parsing QR code data:", parseError);
        throw new Error("Invalid QR code format. Please scan a valid QR code.");
      }

      // Create the general attendance record
      await createGeneralAttendance(eventData);

      setDialogState({
        isOpen: true,
        type: "success",
        message:
          "Your attendance has been recorded for this event. Thank you for participating!",
      });
      setScanMode(null);
    } catch (err) {
      console.error("Error processing QR code:", err);
      if (err instanceof Error) {
        if (err.message.includes("User not found")) {
          setError(
            "User not found. Please ensure you are logged in and your account is properly set up."
          );
        } else if (err.message.includes("No active session found")) {
          setError("No active session found. Please log in and try again.");
        } else if (
          err.message.includes(
            "You have already recorded attendance for this event"
          )
        ) {
          setDialogState({
            isOpen: true,
            type: "error",
            message: "You have already recorded attendance for this event.",
          });
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
              await processQRCode(code.data);
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

  const resetScanner = () => {
    setScanMode(null);
    setError(null);
    setIsLoading(false);
    setUploadedImage(null);
    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const ScanningAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-1 bg-primary/20 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="bg-primary text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">
            Event Attendance Scanner
          </CardTitle>
        </CardHeader>
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
                {scanMode === "camera" ? (
                  <div className="relative">
                    <QrReader
                      onResult={handleScan}
                      constraints={{ facingMode: "environment" }}
                      videoId="qr-reader-video"
                      scanDelay={300}
                      containerStyle={{ width: "100%" }}
                      videoStyle={{ width: "100%" }}
                    />
                    <ScanningAnimation />
                  </div>
                ) : uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded QR Code"
                      className="w-full"
                    />
                    {isScanning && <ScanningAnimation />}
                  </div>
                ) : null}
                <p className="text-center mt-2 text-sm text-gray-600">
                  {scanMode === "camera"
                    ? "Align QR code within the frame"
                    : isScanning
                    ? "Scanning uploaded image..."
                    : "Processing uploaded image..."}
                </p>
                <Button
                  onClick={resetScanner}
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
      <ResultDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        type={dialogState.type}
        message={dialogState.message}
      />
    </>
  );
}
