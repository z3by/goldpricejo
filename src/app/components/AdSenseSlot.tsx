"use client";

import { useEffect, useRef } from "react";

interface AdSenseSlotProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdSenseSlot({
  slot,
  format = "auto",
  responsive = true,
  style = { display: "block" },
}: AdSenseSlotProps) {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const initialized = useRef(false);

  useEffect(() => {
    if (adClientId && typeof window !== "undefined" && !initialized.current) {
      try {
        const adsbygoogle = (window as unknown as { adsbygoogle?: Record<string, unknown>[] }).adsbygoogle || [];
        adsbygoogle.push({});
        initialized.current = true;
      } catch (err) {
        console.error("AdSense initialization error: ", err);
      }
    }
  }, [adClientId]);

  if (!adClientId) {
    return null;
  }

  return (
    <div
      className="adsense-slot-container"
      style={{
        width: "100%",
        marginTop: "1rem",
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        minHeight: "50px",
      }}
    >
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adClientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
