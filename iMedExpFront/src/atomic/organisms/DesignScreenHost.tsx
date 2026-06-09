import { router } from "expo-router";
import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { WebViewMessageEvent } from "react-native-webview";
import { DesignWebView } from "@/atomic/atoms/DesignWebView";
import { findDesignScreen } from "@/design/generated/registry";
import { createDesignHtml } from "@/design/generated/designHtml";
import { parseDesignBridgeMessage } from "@/design/messages";
import { getCurrentUser, login } from "@/services/auth/authApi";
import { saveSession } from "@/state/sessionStore";
import { routeForRole } from "@/navigation/roleRoutes";

type DesignScreenHostProps = {
  screenId: string | undefined;
};

export function DesignScreenHost({ screenId }: DesignScreenHostProps) {
  const screen = findDesignScreen(screenId);
  const html = useMemo(() => createDesignHtml(screen), [screen]);
  const { width } = useWindowDimensions();

  async function handleMessage(event: WebViewMessageEvent) {
    const message = parseDesignBridgeMessage(event.nativeEvent.data);

    if (!message) {
      return;
    }

    if (message.type === "navigate") {
      router.push(`/screen/${message.target}`);
      return;
    }

    if (message.type === "login") {
      const tokens = await login(message.payload);
      const user = await getCurrentUser(tokens.access_token);
      await saveSession(tokens, user);
      router.replace(`/screen/${routeForRole(user.role, width < 720)}`);
    }
  }

  return <DesignWebView html={html} onMessage={handleMessage} />;
}
