/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Camera, CheckCircle } from "lucide-react";
import {
  createUserAttendance,
  User,
  EventData,
} from "@/lib/attendance/attendance";
import jsQR from "jsqr";
import Webcam from "react-webcam";

type ScanMode = "camera" | "image" | null;

interface QRCodeScannerProps {
  eventData: EventData;
  onSuccessfulScan: () => void;
}

const SuccessOverlay = ({ name }: { name: string }) => (
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
    <div className="bg-white p-4 rounded-lg shadow-lg text-center">
      <CheckCircle className="mx-auto mb-2 text-green-500 h-12 w-12" />
      <p className="text-lg font-semibold">QR Code Scanned Successfully!</p>
      <p className="text-sm text-gray-600">
        Welcome, {name}! Processing your attendance...
      </p>
    </div>
  </div>
);

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

export default function QRCodeScanner({
  eventData,
  onSuccessfulScan,
}: QRCodeScannerProps) {
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
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [scannedUserData, setScannedUserData] = useState<User | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const resetScanner = () => {
    setScanMode(null);
    setError(null);
    setIsLoading(false);
    setUploadedImage(null);
    setIsScanning(false);
    setIsCameraEnabled(true);
    setShowSuccessOverlay(false);
    setScannedUserData(null);
    setDialogState({ isOpen: false, type: "success", message: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    resetScanner();
  }, []);

  const processQRCode = useCallback(
    async (imageSrc: string) => {
      try {
        setIsLoading(true);
        setShowSuccessOverlay(true);

        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            let userData: User;
            try {
              userData = JSON.parse(code.data);
              if (
                !userData.userId ||
                !userData.studentId ||
                !userData.name ||
                !userData.degreeProgram ||
                !userData.yearLevel ||
                !userData.section
              ) {
                throw new Error(
                  "Invalid QR code data: missing required fields"
                );
              }
              setScannedUserData(userData);

              const result = await createUserAttendance(userData, eventData);

              if (result === null) {
                setDialogState({
                  isOpen: true,
                  type: "error",
                  message: `${userData.name}, you have already recorded attendance for this event.`,
                });
              } else {
                setDialogState({
                  isOpen: true,
                  type: "success",
                  message: `Attendance recorded for ${userData.name}. Thank you for participating!`,
                });
                onSuccessfulScan();
              }
            } catch (parseError) {
              console.error("Error parsing QR code data:", parseError);
              throw new Error(
                "Invalid QR code format. Please scan a valid QR code."
              );
            }
          } else {
            setError(
              "No QR code found in the image. Please try again with a clear image of a QR code."
            );
          }
        }
      } catch (err) {
        console.error("Error processing QR code:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setShowSuccessOverlay(false);
      }
    },
    [eventData, onSuccessfulScan]
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setIsLoading(true);
        setScanMode("image");
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageSrc = e.target?.result as string;
          setUploadedImage(imageSrc);
          setIsScanning(true);
          try {
            await processQRCode(imageSrc);
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
    },
    [processQRCode]
  );

  const captureImage = useCallback(() => {
    console.log("Capture button clicked");
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUploadedImage(imageSrc);
      processQRCode(imageSrc);
      setScanMode("image");
    }
  }, [processQRCode]);

  return (
    <>
      <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {scanMode && !dialogState.isOpen ? (
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
                    isCameraEnabled ? (
                      <div className="relative">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{ facingMode: "environment" }}
                          className="w-full aspect-square object-cover"
                        />
                        <Button
                          onClick={captureImage}
                          type="button"
                          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
                        >
                          Capture QR Code
                        </Button>
                        {!showSuccessOverlay && <ScanningAnimation />}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">
                          Camera disabled after successful scan
                        </p>
                      </div>
                    )
                  ) : uploadedImage ? (
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "1", maxHeight: "60vh" }}
                    >
                      <img
                        src={uploadedImage}
                        alt="Uploaded QR Code"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  {showSuccessOverlay && scannedUserData && (
                    <SuccessOverlay name={scannedUserData.name} />
                  )}
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  {scanMode === "camera"
                    ? isCameraEnabled
                      ? "Align QR code within the frame and tap Capture"
                      : "QR code scanned. Camera disabled."
                    : isScanning
                    ? "Scanning uploaded image..."
                    : "Processing uploaded image..."}
                </p>
                <Button
                  onClick={resetScanner}
                  className="w-full mt-2 bg-secondary hover:bg-secondary/90 transition-all duration-300"
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
                className="space-y-2 sm:space-y-4"
              >
                <Button
                  onClick={() => {
                    setScanMode("camera");
                    setIsCameraEnabled(true);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                  disabled={isLoading}
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
          {dialogState.isOpen && (
            <Alert
              variant={
                dialogState.type === "success" ? "default" : "destructive"
              }
              className="mt-4"
            >
              <AlertTitle>
                {dialogState.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{dialogState.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
}
