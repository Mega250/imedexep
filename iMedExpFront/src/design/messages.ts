export type DesignBridgeMessage =
  | {
      type: "ready";
      screen: string;
    }
  | {
      type: "navigate";
      target: string;
    }
  | {
      type: "login";
      payload: {
        email: string;
        password: string;
      };
    };

export function parseDesignBridgeMessage(value: string): DesignBridgeMessage | null {
  try {
    const payload = JSON.parse(value) as DesignBridgeMessage;
    if (payload && typeof payload.type === "string") {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}
