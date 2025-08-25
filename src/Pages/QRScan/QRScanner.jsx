// QRScanner.jsx
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

const QRScanner = () => {
  const [startScan, setStartScan] = useState(false);
  const [result, setResult] = useState("");

  const handleScan = (data) => {
    if (data) {
      setResult(data?.text || data); // save QR result
      setStartScan(false); // stop camera after success
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {!startScan ? (
        <button
          onClick={() => setStartScan(true)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Start QR Scan
        </button>
      ) : (
        <div style={{ width: "300px", margin: "20px auto" }}>
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result, error) => {
              if (!!result) {
                handleScan(result);
              }
              if (!!error) {
                handleError(error);
              }
            }}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px", fontSize: "18px" }}>
          <strong>QR Result:</strong> {result}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
