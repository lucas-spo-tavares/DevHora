import { useEffect, useState } from "react";

type SiteManifest = {
  apkPath: string | null;
  generatedAt: string;
  hasApk: boolean;
  hasScreenshots: boolean;
};

const fallbackManifest: SiteManifest = {
  apkPath: null,
  generatedAt: "",
  hasApk: false,
  hasScreenshots: true
};

export function useSiteManifest() {
  const [manifest, setManifest] = useState<SiteManifest>(fallbackManifest);

  useEffect(() => {
    let active = true;

    void fetch("/generated/site-manifest.json")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("manifest unavailable");
        }

        return (await response.json()) as SiteManifest;
      })
      .then((data) => {
        if (active) {
          setManifest(data);
        }
      })
      .catch(() => {
        if (active) {
          setManifest(fallbackManifest);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return manifest;
}
