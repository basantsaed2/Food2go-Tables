import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { useDispatch } from 'react-redux';

const QRScanner = () => {
  const [result, setResult] = useState('No result');
  const [isScanning, setIsScanning] = useState(true); // Start scanning automatically
  const dispatch = useDispatch();

  const handleScan = (data) => {
    if (data) {
      setResult(data);
      setIsScanning(false); // Stop scanning after successful scan
    }
  };

  const handleError = (err) => {
    console.error('QR Reader Error:', err);
    setResult(`Error: ${err.message}`);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  // Optional: Ensure scanning starts on mount (if not using initial state)
  useEffect(() => {
    setIsScanning(true);
    return () => setIsScanning(false); // Cleanup on unmount
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>QR Code Scanner</h2>
      {isScanning ? (
        <>
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
            constraints={{ facingMode: 'environment' }} // Use back camera
          />
          <button
            onClick={stopScanning}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              marginTop: '10px',
              cursor: 'pointer',
            }}
          >
            Stop Scanning
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsScanning(true)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Restart Scanning
        </button>
      )}
      <p style={{ marginTop: '20px' }}>Scanned Result: {result}</p>
    </div>
  );
};

export default QRScanner;