/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const QrReader = dynamic(
  () => import("react-qr-reader").then((mod) => mod.QrReader),
  {
    ssr: false,
  }
) as React.ComponentType<any>;

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

export default function QRCodeScanner() {
  const [scannedData, setScannedData] = useState<AttendanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (result: any) => {
    if (result) {
      try {
        const parsedData: AttendanceData = JSON.parse(result.text);
        setScannedData(parsedData);
        setError(null);
        setIsScanning(false);
      } catch (err) {
        setError("Invalid QR code format");
        setScannedData(null);
      }
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScannedData(null);
    setError(null);
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
          {isScanning ? (
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
                constraints={{ facingMode: "environment" }}
                containerStyle={{ width: "100%" }}
              />
              <p className="text-center mt-2 text-sm text-gray-600">
                Align QR code within the frame
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={startScanning}
                className="w-full mb-4 bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Start Scanning"
                )}
              </Button>
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
              <Alert variant="destructive" className="mb-4">
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
              className="space-y-2 bg-gray-50 p-4 rounded-lg"
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
