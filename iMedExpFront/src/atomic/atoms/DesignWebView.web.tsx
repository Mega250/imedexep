import { useEffect } from "react";

type WebMessageEvent = {
  nativeEvent: {
    data: string;
  };
};

type DesignWebViewProps = {
  html: string;
  onMessage: (event: WebMessageEvent) => void;
};

export function DesignWebView({ html, onMessage }: DesignWebViewProps) {
  useEffect(() => {
    function handler(event: MessageEvent) {
      if (typeof event.data === "string") {
        onMessage({ nativeEvent: { data: event.data } });
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onMessage]);

  return (
    <iframe
      title="iMedExp"
      srcDoc={html}
      style={{ flex: 1, width: "100%", border: "none", backgroundColor: "#FFFFFF" }}
    />
  );
}
