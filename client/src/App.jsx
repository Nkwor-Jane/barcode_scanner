import { useState, useEffect, useRef } from 'react';
import Quagga from "quagga"
import axios from 'axios';
import './App.css'

function App() {
  const [scannedCode, setScannedCode] = useState("");
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("")
  const scannerRef = useRef(null)

  useEffect(() => {
    if (!scannerRef.current) return; // Ensure the scanner div exists before initializing
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current, //Attach video to div
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment", // Rear camera
          },
        },
        decoder: {
          readers: ["code_128_reader"], // Supports multiple barcode formats
        },
      },
      (err) => {
        if (err) {
          console.error("Error initializing Quagga:", err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected(async (data) => {
      const barcode = data.codeResult.code;
      setScannedCode(barcode);
      Quagga.stop(); // Stop scanning once detected

      try {
        const response = await axios.get(`https://barcode-scanner-rvq0.onrender.com/get-user/${barcode}`);
        setUserData(response.data);
        setError("")
      } catch (error) {
        setUserData(null);
        setError("User not found!");
      }
    });

    return () => {
      Quagga.stop();
    };
  }, []);
  return (
    <div>
      <h1>Barcode Scanner</h1>

      <h2>Scanned Code: {scannedCode || "No barcode scanned"}</h2>
      {error && <p style={{color: "red"}}> {error}</p>}
      {userData ? (
        <div>
          <h3>User Details:</h3>
          <p><strong>Name:</strong>{userData.name}</p>
          <p><strong>Email:</strong>{userData.email}</p>
        </div>
      ): (
        <p>No user data available. Scan a barcode</p>
      )}
      <div ref={scannerRef} id="barcode-scanner" style={{width:"100%"}}/>
    </div>  
  )
}

export default App
