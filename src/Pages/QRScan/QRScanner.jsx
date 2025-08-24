import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, CheckCircle, XCircle } from 'lucide-react';

const QRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // QR Code detection function
  const detectQRCode = (imageData) => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Simple QR code detection logic
    // This is a basic implementation - in production, you'd use a library like jsQR
    try {
      // Check if video is ready
      if (videoRef.current.readyState !== 4) {
        return null;
      }
      
      // Draw the current video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataFromCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Here we would normally use a QR code library like jsQR
      // For demonstration, we'll simulate QR detection
      // In a real app, you'd install and use jsQR library
      
      // Simulated QR detection (replace with actual jsQR implementation)
      const simulateQRDetection = () => {
        // This is just a placeholder - replace with actual QR detection
        const mockQRData = [
          'https://example.com',
          'Hello World!',
          '{"name": "John", "age": 30}',
          'Contact: +1234567890'
        ];
        
        // Simulate random QR detection after some time
        if (Math.random() > 0.95) {
          return mockQRData[Math.floor(Math.random() * mockQRData.length)];
        }
        return null;
      };
      
      return simulateQRDetection();
      
    } catch (err) {
      console.error('QR detection error:', err);
      return null;
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      setScannedData('');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      // Check camera permissions first
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        console.log('Camera permission status:', permissionStatus.state);
      } catch (permErr) {
        console.log('Permission query not supported, proceeding with camera request');
      }

      console.log('Requesting camera access...');
      
      // Try with back camera first (for mobile)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Back camera
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera:', backCameraError);
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
      }

      console.log('Camera access granted');
      streamRef.current = stream;
      setIsScanning(true);
      
      // Wait for component to render video element, then set stream
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

      // Start scanning loop after a short delay to ensure video is ready
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
          }, 100);
        }
      }, 500);

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
      } else if (err.message.includes('not supported')) {
        errorMessage += 'Your browser does not support camera access.';
      } else {
        errorMessage += `Error: ${err.message}`;
      }
      
      setError(errorMessage);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const resetScanner = () => {
    setScannedData('');
    setError('');
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-center space-x-2">
            <Camera size={24} />
            <h1 className="text-xl font-semibold">QR Code Scanner</h1>
          </div>
        </div>

        {/* Scanner Area */}
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

          {/* Video Preview */}
          {isScanning && (
            <div className="text-center">
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover rounded-lg border-4 border-blue-200"
                />
                <canvas
                  ref={canvasRef}
                  width="640"
                  height="480"
                  className="hidden"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-blue-500 w-48 h-48 rounded-lg animate-pulse"></div>
                </div>
              </div>
              
              <div className="text-blue-600 mb-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Scanning for QR codes...</p>
              </div>
              
              <button
                onClick={stopScanning}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Stop Scanning
              </button>
            </div>
          )}

          {/* Success Result */}
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

          {/* Error State */}
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

        {/* Instructions */}
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