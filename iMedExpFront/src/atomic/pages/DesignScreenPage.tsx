import { DesignScreenHost } from "@/atomic/organisms/DesignScreenHost";
import { NativeSurface } from "@/atomic/templates/NativeSurface";

type DesignScreenPageProps = {
  screenId: string | undefined;
};

export function DesignScreenPage({ screenId }: DesignScreenPageProps) {
  return (
    <NativeSurface>
      <DesignScreenHost screenId={screenId} />
    </NativeSurface>
  );
}
