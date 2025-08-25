import { BrowserQRCodeReader } from '@zxing/library';
import { useState, useEffect, useRef } from 'react';

const QRScanner = () => {
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);
    
    useEffect(() => {
        codeReaderRef.current = new BrowserQRCodeReader();
        
        const startScanning = async () => {
            try {
                setIsScanning(true);
                setError('');
                
                await codeReaderRef.current.decodeFromVideoDevice(
                    undefined, // Use default camera
                    videoRef.current,
                    (result, error) => {
                        if (result) {
                            setResult(result.getText());
                            console.log('QR Code detected:', result.getText());
                        }
                        if (error) {
                            // This is normal - it means no QR code is found yet
                            // Only show actual errors, not "not found" exceptions
                            if (!error.message?.includes('NotFoundException')) {
                                console.error('Scan error:', error);
                                setError(error.message);
                            }
                        }
                    }
                );
                
            } catch (error) {
                console.error('Error starting scanner:', error);
                setError(error.message || 'Failed to start camera. Please check permissions.');
                setIsScanning(false);
            }
        };

        startScanning();

        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, []);

    const stopScanning = () => {
        if (codeReaderRef.current) {
            codeReaderRef.current.reset();
            setIsScanning(false);
        }
    };

    const restartScanning = () => {
        setResult('');
        setError('');
        // The scanner will automatically continue scanning
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h2 className="text-center mb-4">QR Code Scanner</h2>
            
            <div style={{ position: 'relative' }}>
                <video 
                    ref={videoRef}
                    style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        minHeight: '300px'
                    }}
                    autoPlay
                    playsInline
                    muted
                />
                {isScanning && !result && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        fontSize: '18px'
                    }}>
                        👆 Point camera at QR code
                    </div>
                )}
            </div>

            {error && (
                <div className="alert alert-danger mt-3">
                    <strong>Error:</strong> {error}
                    <button 
                        onClick={restartScanning}
                        className="btn btn-sm btn-outline-danger ms-3"
                    >
                        Try Again
                    </button>
                </div>
            )}
            
            {result && (
                <div className="mt-4 p-3 bg-success text-white rounded">
                    <h4>✅ Success! Scanned Result:</h4>
                    <p className="lead">{result}</p>
                    <div className="d-flex gap-2">
                        <button 
                            onClick={restartScanning}
                            className="btn btn-light"
                        >
                            Scan Another QR
                        </button>
                        <button 
                            onClick={stopScanning}
                            className="btn btn-outline-light"
                        >
                            Stop Camera
                        </button>
                    </div>
                </div>
            )}

            {!error && !result && isScanning && (
                <div className="alert alert-info mt-3">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    Camera is active. Point at a QR code to scan.
                </div>
            )}
        </div>
    );
}

export default QRScanner;