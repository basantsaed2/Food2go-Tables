import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';

const QRScanner = () => {
  const [result, setResult] = useState('No result');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = (data) => {
    if (data) {
      setResult(data.text);
      setIsScanning(false);
      setError('');
    }
  };

  const handleError = (err) => {
    console.error('QR Reader Error:', err);
    setError(`Error: ${err.message || 'Failed to access camera'}`);
  };

  // Proper constraints for video only
  const constraints = {
    audio: false, // Explicitly set audio to false
    video: {
      facingMode: 'environment' // Use back camera
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>QR Code Scanner</h2>
      
      {error && (
        <div style={{ color: 'red', margin: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
          {error}
        </div>
      )}
      
      {isScanning && (
        <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            constraints={constraints} // Use the proper constraints
          />
        </div>
      )}
      
      {!isScanning ? (
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
            margin: '10px'
          }}
        >
          Start Scanning
        </button>
      ) : (
        <button
          onClick={() => setIsScanning(false)}
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
          Stop Scanning
        </button>
      )}
      
      <p style={{ marginTop: '20px', fontSize: '16px' }}>
        <strong>Scanned Result:</strong> {result}
      </p>
    </div>
  );
};

export default QRScanner;