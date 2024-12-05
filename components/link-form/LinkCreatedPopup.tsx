import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface LinkCreatedPopupProps {
  shortLink: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
}

export function LinkCreatedPopup({
  shortLink,
  isOpen,
  onClose,
  onCreateNew,
}: LinkCreatedPopupProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The shortened link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Failed to copy",
        description: "There was an error copying the link to your clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Created Successfully</DialogTitle>
          <DialogDescription>
            Your shortened link is ready to use and share.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={shortLink} readOnly />
          <Button onClick={copyToClipboard}>
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onCreateNew}>Create New Link</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
