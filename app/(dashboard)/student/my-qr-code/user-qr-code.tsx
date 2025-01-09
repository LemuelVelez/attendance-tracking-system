/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { getCurrentUser } from "@/lib/attendance/attendance";

interface User {
  userId: string;
  studentId: string;
  name: string;
  degreeProgram: string;
  yearLevel: string;
  section: string;
}

export default function UserQR() {
  const [user, setUser] = useState<User | null>(null);
  const [qrCodeSrc, setQrCodeSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const qrCodeDataURL = await generateQRCode(currentUser);
          setQrCodeSrc(qrCodeDataURL);
        }
      } catch (err) {
        setError("Failed to fetch user data. Please try again.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const generateQRCode = async (userData: User): Promise<string> => {
    const qrData = JSON.stringify(userData);
    try {
      return await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "H",
        margin: 4,
        width: 300,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No user data available. Please log in and try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Your QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {qrCodeSrc && (
            <img
              src={qrCodeSrc}
              alt="User QR Code"
              className="w-64 h-64 mb-4"
            />
          )}
          <div className="text-center">
            <p className="font-semibold">{user.name}</p>
            <p>Student ID: {user.studentId}</p>
            <p>Course: {user.degreeProgram}</p>
            <p>
              Year: {user.yearLevel}
              <br /> Section: {user.section}
            </p>
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              const link = document.createElement("a");
              link.download = `${user.name}-QR.png`;
              link.href = qrCodeSrc;
              link.click();
            }}
          >
            Download QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
