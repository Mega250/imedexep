import { Component, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Props = {
  children: ReactNode;
  /** Cambia este valor (p. ej. el id de pantalla) para resetear el boundary al navegar. */
  resetKey?: string;
};

type State = { error: Error | null };

/**
 * Captura cualquier error de render de una pantalla y muestra un fallback
 * en lugar de dejar la app en blanco (pantalla blanca = árbol desmontado).
 * Se resetea solo al cambiar `resetKey`, para que al navegar a otra pantalla
 * se vuelva a intentar renderizar con normalidad.
 */
export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props): void {
    // Al navegar (resetKey distinto) limpiamos el error y reintentamos.
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <View style={styles.card}>
            <Text style={styles.title}>Algo salió mal en esta pantalla</Text>
            <Text style={styles.sub}>
              No te preocupes, tu sesión sigue activa. Puedes reintentar o volver atrás.
            </Text>
            <Button label="Reintentar" size="sm" block={false} onPress={this.handleRetry} />
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.paper
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 10,
    padding: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl
  },
  title: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    textAlign: "center"
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 11,
    lineHeight: 16,
    color: colors.ink3,
    textAlign: "center",
    marginBottom: 6
  }
});
