import QRCodeScanner from "@/components/QRCodeScanner";

export default function Scanner() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-gray-600 mb-8">
          Quickly scan QR codes to record event attendance. Simply click
          &quot;Scan with camera or Upload the QR code image&quot; and align the
          QR code within the frame.
        </p>
        <QRCodeScanner />
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Having trouble? Make sure your camera is enabled and the QR code is
            clearly visible.
          </p>
        </div>
      </div>
    </main>
  );
}
