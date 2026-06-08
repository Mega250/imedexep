import { WebView, WebViewMessageEvent } from "react-native-webview";

type DesignWebViewProps = {
  html: string;
  onMessage: (event: WebViewMessageEvent) => void;
};

export function DesignWebView({ html, onMessage }: DesignWebViewProps) {
  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html, baseUrl: "" }}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      allowsInlineMediaPlayback
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
    />
  );
}
