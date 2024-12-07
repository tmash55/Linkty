"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Copy, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QRCodeSettings {
  bgColor: string;
  fgColor: string;
  logoUrl?: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

interface QRCodeGeneratorProps {
  shortUrl: string;
  originalUrl: string;
  initialSettings?: QRCodeSettings;
  onSave: (settings: QRCodeSettings) => Promise<void>;
}

const colorPresets = [
  { name: "Classic", bg: "#FFFFFF", fg: "#000000" },
  { name: "Inverted", bg: "#000000", fg: "#FFFFFF" },
  { name: "Blue Sky", bg: "#E6F3FF", fg: "#0066CC" },
  { name: "Sunset", bg: "#FFF0E6", fg: "#CC3300" },
];

export default function QRCodeGenerator({
  shortUrl,
  originalUrl,
  initialSettings,
  onSave,
}: QRCodeGeneratorProps) {
  const [settings, setSettings] = useState<QRCodeSettings>(
    initialSettings || {
      bgColor: "#FFFFFF",
      fgColor: "#000000",
      errorCorrectionLevel: "H",
    }
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialSettings?.logoUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSettingsChange = (key: keyof QRCodeSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (preset: { bg: string; fg: string }) => {
    setSettings((prev) => ({
      ...prev,
      bgColor: preset.bg,
      fgColor: preset.fg,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = async () => {
    const svg = document.getElementById("qr-code");
    if (!svg) {
      toast({
        title: "Error",
        description: "QR code not found.",
        variant: "destructive",
      });
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const item = new ClipboardItem({ "image/svg+xml": blob });

    try {
      await navigator.clipboard.write([item]);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "QR code copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying QR code:", error);
      toast({
        title: "Error",
        description: "Failed to copy QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (format: "png" | "svg") => {
    setIsLoading(true);
    const svg = document.getElementById("qr-code");
    if (!svg) {
      toast({
        title: "Error",
        description: "QR code not found.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);

    try {
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
          canvas.width = 256;
          canvas.height = 256;
          ctx!.drawImage(img, 0, 0, 256, 256);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = "qrcode.png";
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ ...settings, logoUrl: logoUrl || undefined });
      toast({
        title: "Settings Saved",
        description: "Your QR code settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving QR code settings:", error);
      toast({
        title: "Error",
        description: "Failed to save QR code settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const qrCodeValue = useMemo(() => {
    if (!shortUrl) {
      setQrError("No short URL provided");
      return "";
    }
    setQrError(null);
    try {
      console.log("Short URL:", shortUrl);
      console.log("Original URL:", originalUrl);
      const url = new URL(shortUrl);
      url.searchParams.set("qr", "1");
      const finalUrl = url.toString();
      console.log("Generated QR code URL:", finalUrl);
      return finalUrl;
    } catch (error) {
      console.error("Invalid URL:", error);
      setQrError("Invalid URL format");
      return shortUrl;
    }
  }, [shortUrl, originalUrl]);

  if (qrError) {
    return <div style={{ color: "red" }}>{qrError}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="originalUrl" className="text-lg font-semibold">
                Original URL
              </Label>
              <Input
                id="originalUrl"
                type="text"
                value={originalUrl}
                readOnly
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="shortUrl" className="text-lg font-semibold">
                Short URL
              </Label>
              <Input
                id="shortUrl"
                type="text"
                value={shortUrl}
                readOnly
                className="mt-2"
              />
            </div>
            <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
              {shortUrl && !qrError ? (
                <QRCodeSVG
                  id="qr-code"
                  value={qrCodeValue}
                  size={256}
                  bgColor={settings.bgColor}
                  fgColor={settings.fgColor}
                  level={settings.errorCorrectionLevel}
                  includeMargin={true}
                  imageSettings={
                    logoUrl
                      ? {
                          src: logoUrl,
                          height: 24,
                          width: 24,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              ) : (
                <p className="text-red-500">
                  {qrError || "Please enter a valid URL"}
                </p>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleCopy}
                className="w-full"
                disabled={isLoading || !!qrError}
                variant="outline"
              >
                {isCopied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {isCopied ? "Copied!" : "Copy"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={isLoading || !!qrError}
                    variant="outline"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleDownload("svg")}
                    className="py-2"
                  >
                    <span>Download SVG</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownload("png")}
                    className="py-2"
                  >
                    <span>Download PNG</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={isLoading || !!qrError}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Settings
            </Button>
          </div>
          <div className="space-y-6">
            <Tabs defaultValue="colors">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="colors" className="space-y-4">
                <div>
                  <Label htmlFor="bgColor" className="text-sm font-medium">
                    Background Color
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="bgColor"
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) =>
                        handleSettingsChange("bgColor", e.target.value)
                      }
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={settings.bgColor}
                      onChange={(e) =>
                        handleSettingsChange("bgColor", e.target.value)
                      }
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
                      value={settings.fgColor}
                      onChange={(e) =>
                        handleSettingsChange("fgColor", e.target.value)
                      }
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      value={settings.fgColor}
                      onChange={(e) =>
                        handleSettingsChange("fgColor", e.target.value)
                      }
                      className="flex-grow"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        onClick={() => handlePresetChange(preset)}
                        className="w-full"
                        variant="outline"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="logo" className="space-y-4">
                <div>
                  <Label htmlFor="logo" className="text-sm font-medium">
                    Upload Logo
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="logo"
                      type="file"
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Logo
                    </Button>
                  </div>
                </div>

                {logoUrl && (
                  <div className="flex justify-center">
                    <img
                      src={logoUrl}
                      alt="Uploaded logo"
                      className="max-w-full h-auto max-h-32"
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <Label
                    htmlFor="errorCorrection"
                    className="text-sm font-medium"
                  >
                    Error Correction Level
                  </Label>
                  <Select
                    value={settings.errorCorrectionLevel}
                    onValueChange={(value) =>
                      handleSettingsChange(
                        "errorCorrectionLevel",
                        value as "L" | "M" | "Q" | "H"
                      )
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select error correction level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low</SelectItem>
                      <SelectItem value="M">Medium</SelectItem>
                      <SelectItem value="Q">Quartile</SelectItem>
                      <SelectItem value="H">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
