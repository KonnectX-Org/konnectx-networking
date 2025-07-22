import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import QRCode from "react-qr-code";
import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useUser } from "../hooks/UserContext";

const QRPage = () => {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const { user } = useUser();
  const [scannedURL, setScannedURL] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannedURL) window.location.href = scannedURL;
  }, [scannedURL]);

  useEffect(() => {
    // Initialize scanner when opened
    if (isScannerOpen && scannerContainerRef.current) {
      // Create instance
      scannerRef.current = new Html5Qrcode("qr-scanner-container");
      
      // Start scanning
      scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // On successful scan
          console.log("QR code detected:", decodedText);
          setScannedURL(decodedText);
          // Stop scanner after successful scan
          if (scannerRef.current) {
            scannerRef.current.stop();
          }
        },
        (errorMessage) => {
          // Errors are common during scanning, so we only log more serious ones
          if (!(errorMessage.includes("No QR code found"))) {
            console.error("QR Scan error:", errorMessage);
          }
        }
      ).catch(err => {
        console.error("Failed to start scanner:", err);
      });
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => {
          console.error("Failed to stop scanner:", err);
        });
        scannerRef.current = null;
      }
    };
  }, [isScannerOpen]);

  const toggleScanner = () => {
    // If currently open, stop the scanner first
    if (isScannerOpen && scannerRef.current) {
      scannerRef.current.stop().catch(err => {
        console.error("Failed to stop scanner:", err);
      });
    }
    setIsScannerOpen(!isScannerOpen);
  };

  return (
    <div
      className="w-full flex flex-col flex-1"
      style={{
        height: window.innerHeight,
      }}
    >
      <div className="flex-[0.08] h-full bg-grey01 px-3 flex items-center">
        <div className="text-darkBg space-x-3 flex items-center">
          <Icon
            onClick={() => navigate(-1)}
            icon="proicons:arrow-left"
            width="24"
            height="24"
          />
          <p className="font-medium">Scan QR</p>
        </div>
      </div>
      <div className="flex-[0.92] flex flex-col w-full h-full items-center justify-center">
        {isScannerOpen ? (
          <div className="w-full max-w-sm">
            <div id="qr-scanner-container" ref={scannerContainerRef} className="w-full h-64" />
            <p className="text-center mt-2 text-sm text-gray-500">Position QR code within the frame</p>
          </div>
        ) : (
          <div className="flex-[0.7] w-full flex justify-center items-center">
            <div className="w-[87%] h-fit flex flex-col items-center space-y-5 bg-[linear-gradient(0deg,_#F1ADAD_29%,_#FFDCC6_100%)] rounded-xl py-5">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-darkBg">{user?.name}</h1>
                <p className="text-xs text-grey">{user?.position}</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <QRCode
                  value={`${window.location.protocol}//${window.location.host}/qr-connect/${user?._id}`}
                  size={220}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-[0.3] w-full flex justify-center items-center">
        <CustomButton
          text={isScannerOpen ? "Show QR" : "Scan QR"}
          onClick={toggleScanner}
        />
      </div>
    </div>
  );
};

export default QRPage;