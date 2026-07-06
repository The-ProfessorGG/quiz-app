import { QRCodeSVG } from "qrcode.react";

// Renders a scannable QR code for a link, with the plain link text
// underneath (useful if someone can't scan and needs to type it in).
export default function QRCodeBox({ url, size = 220 }) {
  return (
    <div className="qr-box">
      <div className="qr-white-card">
        <QRCodeSVG value={url} size={size} bgColor="#ffffff" fgColor="#000000" />
      </div>
      <p className="qr-link">{url}</p>
    </div>
  );
}
