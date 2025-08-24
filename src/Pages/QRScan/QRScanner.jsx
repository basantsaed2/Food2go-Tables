import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { useDispatch } from 'react-redux';

const QRScanner = () => {
  const [result, setResult] = useState('No result');
  const [isScanning, setIsScanning] = useState(true);
  const dispatch = useDispatch();

  const handleScan = (data) => {
    if (data) {
      setResult(data);
      setIsScanning(false); // Stop scanning after successful scan
      console.log('QR Code detected:', data);
    }
  };

  const handleError = (err) => {
    console.error('QR Reader Error:', err);
    setResult(`Error: ${err.message}`);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>QR Code Scanner</h2>
      {isScanning ? (
        <>
          <QrReader
            delay={300}
            onError={handleError}
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text);
              }
              if (error) {
                console.info(error);
              }
            }}
            constraints={{ 
              facingMode: 'environment',
              aspectRatio: 1 // Helps with square QR code detection
            }}
            style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
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