import React, { useState, useRef, useEffect } from 'react';

const QRScanner = () => {
  const [result, setResult] = useState('No result');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [browserInfo, setBrowserInfo] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  // Check if BarcodeDetector is supported and get browser info
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setBrowserInfo(userAgent);
    
    const checkSupport = async () => {
      try {
        // Check if BarcodeDetector exists and works
        if ('BarcodeDetector' in window) {
          // Test if the API is actually functional
          const supported = await BarcodeDetector.getSupportedFormats();
          setIsSupported(supported.includes('qr_code'));
        } else {
          setIsSupported(false);
        }
      } catch (err) {
        console.log('BarcodeDetector not fully supported:', err);
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setResult('Scanning...');
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsScanning(true);

      // Use BarcodeDetector API if supported
      if (isSupported) {
        const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
        
        const detectBarcode = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                setResult(barcodes[0].rawValue);
                stopScanning();
                return;
              }
            } catch (err) {
              console.error('Barcode detection error:', err);
            }
          }
          
          if (isScanning) {
            animationRef.current = requestAnimationFrame(detectBarcode);
          }
        };
        
        // Start detection when video starts playing
        if (videoRef.current.readyState >= 2) {
          detectBarcode();
        } else {
          videoRef.current.onplaying = detectBarcode;
        }
      } else {
        // Fallback: Manual scanning instructions
        setError('Auto-scan not supported. Please take a photo and use a QR scanner app.');
      }
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Camera error: ${err.message}`);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in your browser.');
      } else if (err.name === 'SecurityError') {
        setError('Camera access blocked for security reasons. Try using HTTPS.');
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Manual QR code input handler
  const handleManualInput = (event) => {
    setResult(event.target.value);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>QR Code Scanner</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          margin: '10px', 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      {!isSupported && (
        <div style={{ 
          color: 'orange', 
          margin: '10px', 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          ⚠️ Auto-scan not supported in your browser. 
          <br />
          <strong>Chrome/Edge users:</strong> Make sure you're on the latest version and enable experimental features.
          <br />
          <strong>Other browsers:</strong> Use the manual input option below.
        </div>
      )}

      {/* Debug info - you can remove this in production */}
      <div style={{ fontSize: '12px', color: '#666', margin: '10px' }}>
        Browser: {browserInfo.split(' ')[0]} | Support: {isSupported ? 'Yes' : 'No'}
      </div>
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          maxWidth: '300px',
          height: '300px',
          margin: '0 auto',
          display: isScanning ? 'block' : 'none',
          border: '2px solid #007bff',
          borderRadius: '8px',
          objectFit: 'cover'
        }}
      />
      
      {!isScanning ? (
        <button
          onClick={startScanning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Start Camera
        </button>
      ) : (
        <button
          onClick={stopScanning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Stop Camera
        </button>
      )}
      
      {/* Manual Input Option */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Manual QR Code Input</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          If auto-scan doesn't work, manually enter the QR code content:
        </p>
        
        <textarea
          value={result}
          onChange={handleManualInput}
          placeholder="Paste QR code content here"
          style={{
            width: '100%',
            maxWidth: '400px',
            height: '80px',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            margin: '10px 0',
            resize: 'vertical'
          }}
        />
        
        <br />
        
        <button
          onClick={() => {
            if (result && result !== 'No result') {
              alert(`QR Code processed: ${result}`);
              // Add your QR code processing logic here
            }
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Process QR Code
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px',
        border: '1px solid #b8d4fd'
      }}>
        <strong>Scanned Result:</strong> 
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: 'white', 
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          wordBreak: 'break-all',
          minHeight: '50px'
        }}>
          {result}
        </div>
      </div>

      {/* Instructions */}
      {!isScanning && isSupported && (
        <div style={{ 
          marginTop: '20px', 
          color: '#6c757d', 
          fontSize: '14px' 
        }}>
          <p>💡 Point your camera at a QR code to scan it</p>
          <p>📱 Make sure the QR code is well-lit and in focus</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;