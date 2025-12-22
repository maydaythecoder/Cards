import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { defaultConfig } from "@tamagui/config/v4";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { createTamagui, TamaguiProvider } from "tamagui";

import { ThemeProvider, useTheme } from "@/context/ThemeContext";

export const unstable_settings = {
  anchor: "(tabs)",
};
const config = createTamagui(defaultConfig);

function RootLayoutContent() {
  const { theme } = useTheme();

  return (
    <TamaguiProvider config={config}>
      <NavThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </NavThemeProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
