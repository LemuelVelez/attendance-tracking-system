/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Camera } from "lucide-react";

interface AttendanceData {
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: string;
  section: string;
  eventName: string;
  location: string;
  date: string;
  day: string;
  time: string;
}

type ScanMode = "camera" | "image" | null;

export default function QRCodeScanner() {
  const [scannedData, setScannedData] = useState<AttendanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError(null);
  }, [scanMode]);

  const handleScan = (result: any) => {
    if (result) {
      processQRCode(result.text);
    }
  };

  const processQRCode = (data: string) => {
    try {
      const parsedData: AttendanceData = JSON.parse(data);
      setScannedData(parsedData);
      setError(null);
      setScanMode(null);
    } catch (err) {
      setError("Invalid QR code format");
      setScannedData(null);
    }
    setIsLoading(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setScanMode("image");
    }
  };

  const resetScanner = () => {
    setScanMode(null);
    setScannedData(null);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
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
              <QrReader
                onResult={handleScan}
                constraints={
                  scanMode === "camera" ? { facingMode: "environment" } : {}
                }
                videoId="qr-reader-video"
                scanDelay={300}
                containerStyle={{ width: "100%" }}
                videoStyle={{ width: "100%" }}
              />
              <p className="text-center mt-2 text-sm text-gray-600">
                {scanMode === "camera"
                  ? "Align QR code within the frame"
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

        <AnimatePresence>
          {scannedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 bg-gray-50 p-4 rounded-lg mt-4"
            >
              <h3 className="text-lg font-semibold text-primary">
                Scanned Attendance Data:
              </h3>
              {Object.entries(scannedData).map(([key, value]) => (
                <p key={key} className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </span>
                  <span className="text-gray-900">{value}</span>
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
