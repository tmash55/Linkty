import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QRCodeGeneratorProps {
  initialUrl: string;
}

export default function QRCodeGenerator({ initialUrl }: QRCodeGeneratorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [fgColor, setFgColor] = useState("#000000");

  const size = 256; // Fixed size

  const handleDownload = (format: "png" | "svg") => {
    const svg = document.getElementById("qr-code");
    const svgData = new XMLSerializer().serializeToString(svg!);

    if (format === "svg") {
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "qrcode.svg";
      downloadLink.click();
      URL.revokeObjectURL(svgUrl);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx!.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="url" className="text-lg font-semibold">
                URL
              </Label>
              <Input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to generate QR code"
                className="mt-2"
              />
            </div>
            <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
              <QRCodeSVG
                id="qr-code"
                value={url}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => handleDownload("png")} className="w-full">
                Download PNG
              </Button>
              <Button onClick={() => handleDownload("svg")} className="w-full">
                Download SVG
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="bgColor" className="text-sm font-medium">
                Background Color
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="bgColor"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 p-1"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-grow"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fgColor" className="text-sm font-medium">
                Pattern Color
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="fgColor"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-12 p-1"
                />
                <Input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-grow"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
