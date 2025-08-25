import React, { useState } from "react";
import QrReader from "react-qr-scanner";

const QRScanner = () => {
  const [data, setData] = useState("No result");

  const handleScan = (result) => {
    if (result) {
      setData(result.text);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const previewStyle = {
    height: 300,
    width: 300,
    position: "relative",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={previewStyle}>
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ height: "100%", width: "100%" }}
        />
        {/* Overlay square */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "200px",
            height: "200px",
            border: "3px solid red",
            transform: "translate(-50%, -50%)",
            boxSizing: "border-box",
          }}
        ></div>
      </div>
      <p className="mt-4">Result: {data}</p>
    </div>
  );
};

export default QRScanner;
