import { Download, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DownloadButtonProps = {
  available: boolean;
  className?: string;
};

export function DownloadButton({ available, className }: DownloadButtonProps) {
  if (!available) {
    return (
      <Button className={className} disabled size="lg" variant="secondary">
        <ShieldCheck className="h-4 w-4" />
        APK em preparo
      </Button>
    );
  }

  return (
    <a
      className={cn(buttonVariants({ size: "lg" }), className)}
      download
      href="/generated/downloads/devhora-latest.apk"
    >
      <Download className="h-4 w-4" />
      Baixar APK
    </a>
  );
}
