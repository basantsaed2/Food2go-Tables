import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, CheckCircle, XCircle } from 'lucide-react';
import jsQR from 'jsqr';

const QRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [error, setError] = useState('');
  const [scanFeedback, setScanFeedback] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    try {
      if (videoRef.current.readyState !== 4) return null;

      canvas.width = Math.min(videoRef.current.videoWidth || 640, 1280);
      canvas.height = Math.min(videoRef.current.videoHeight || 480, 720);

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const contrastFactor = 1.5;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const adjusted = Math.min(255, Math.max(0, (gray - 128) * contrastFactor + 128));
        data[i] = data[i + 1] = data[i + 2] = adjusted;
      }
      ctx.putImageData(imageData, 0, 0);

      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (qrCode && qrCode.data) {
        return qrCode.data;
      }
      return null;
    } catch (err) {
      console.error('QR detection error:', err);
      return null;
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      setScannedData('');
      setScanFeedback('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (backCameraError) {
        console.log('High-res camera failed, trying fallback:', backCameraError);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
      }

      streamRef.current = stream;
      setIsScanning(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.log('Video play error:', err);
            });
          };
        } else {
          setError('Video element not ready. Please try again.');
          stopScanning();
        }
      }, 100);

      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          scanIntervalRef.current = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              const qrData = detectQRCode();
              if (qrData) {
                setScannedData(qrData);
                stopScanning();
              }
            }
          }, 50);
        }
      }, 500);

      setTimeout(() => {
        if (isScanning && !scannedData) {
          setScanFeedback('Move closer to the QR code or improve lighting');
        }
      }, 5000);
    } catch (err) {
      console.error('Camera error details:', err);
      let errorMessage = 'Camera access failed. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported by this browser.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += `Error: ${err.message}`;
      }
      setError(errorMessage);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanFeedback('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const resetScanner = () => {
    setScannedData('');
    setError('');
    setScanFeedback('');
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.focus();
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-center space-x-2">
            <Camera size={24} />
            <h1 className="text-xl font-semibold">QR Code Scanner</h1>
          </div>
        </div>
        <div className="p-6">
          {!isScanning && !scannedData && !error && (
            <div className="text-center">
              <div className="mb-6">
                <Square size={120} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">
                  Click the button below to start scanning QR codes
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={startScanning}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <Camera size={20} />
                  <span>Start Scanning</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const devices = await navigator.mediaDevices.enumerateDevices();
                      const videoDevices = devices.filter(device => device.kind === 'videoinput');
                      alert(`Found ${videoDevices.length} camera(s):\n${videoDevices.map(d => d.label || 'Camera').join('\n')}`);
                    } catch (err) {
                      alert('Cannot check camera devices: ' + err.message);
                    }
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                >
                  Check Camera Devices
                </button>
              </div>
            </div>
          )}
          {isScanning && (
            <div className="text-center">
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  onClick={handleVideoClick}
                  className="w-full h-64 object-cover rounded-lg border-4 border-blue-200"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-blue-500 w-64 h-64 rounded-lg bg-transparent opacity-50"></div>
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-white text-sm bg-black bg-opacity-50 py-1">
                  Align QR code within the square
                </p>
              </div>
              <div className="text-blue-600 mb-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Scanning for QR codes...</p>
                {scanFeedback && <p className="text-red-500 text-sm">{scanFeedback}</p>}
              </div>
              <button
                onClick={stopScanning}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Stop Scanning
              </button>
            </div>
          )}
          {scannedData && (
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">QR Code Detected!</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                <p className="text-sm text-gray-600 mb-1">Scanned Data:</p>
                <p className="text-gray-800 font-mono text-sm break-all">{scannedData}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={resetScanner}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Scan Another
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(scannedData)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center">
              <XCircle size={64} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Scanner Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={resetScanner}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        <div className="bg-gray-50 p-4 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="space-y-1 mb-4">
            <li>• Allow camera permissions when prompted</li>
            <li>• Point your camera at a QR code</li>
            <li>• Hold steady until the code is detected</li>
            <li>• The result will appear automatically</li>
          </ul>
          <h4 className="font-semibold mb-2">Troubleshooting:</h4>
          <ul className="space-y-1">
            <li>• Make sure you're using HTTPS (required for camera access)</li>
            <li>• Click "Check Camera Devices" to verify camera availability</li>
            <li>• Try refreshing the page and allowing permissions again</li>
            <li>• Close other apps that might be using the camera</li>
            <li>• On mobile: try switching between portrait/landscape</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;