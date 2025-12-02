import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Scan } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScan, onClose }: Props) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          stopScanner();
          onScan(decodedText);
        },
        () => {
        }
      );

      setIsScanning(true);
      setCameraPermission(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      setCameraPermission(false);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Scan className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Scan QR Code</h3>
                <p className="text-sm text-gray-600">Access household data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isScanning && cameraPermission !== false && (
              <Button onClick={startScanner} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera Scanner
              </Button>
            )}

            {isScanning && (
              <div className="space-y-3">
                <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
                <Button onClick={stopScanner} variant="ghost" className="w-full">
                  Stop Scanner
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or enter code manually</span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter household QR code (e.g., HH-...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="submit" className="w-full" variant="ghost">
                Submit Code
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};
