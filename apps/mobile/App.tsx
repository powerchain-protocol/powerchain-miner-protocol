import { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { Brand } from "./src/components/Brand";
import { ComputeScreen } from "./src/screens/ComputeScreen";
import { MinersScreen } from "./src/screens/MinersScreen";
import { MoreScreen } from "./src/screens/MoreScreen";
import { OverviewScreen } from "./src/screens/OverviewScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { theme } from "./src/theme";

type Tab = "Overview" | "Miners" | "Compute" | "Rewards" | "More";

const tabs: Tab[] = ["Overview", "Miners", "Compute", "Rewards", "More"];

export default function App() {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.surface}
      />

      <View style={styles.header}>
        <Brand />
        <View style={styles.headerActions}>
          <View style={styles.healthDot} />
          <Text style={styles.headerAction}>LIVE</Text>
        </View>
      </View>

      <View style={styles.body}>
        {tab === "Overview" && <OverviewScreen />}
        {tab === "Miners" && <MinersScreen />}
        {tab === "Compute" && <ComputeScreen />}
        {tab === "Rewards" && <RewardsScreen />}
        {tab === "More" && <MoreScreen />}
      </View>

      <View style={styles.tabs}>
        {tabs.map((item) => {
          const active = item === tab;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(item)}
              style={styles.tab}
            >
              <View
                style={[
                  styles.tabMark,
                  active && styles.tabMarkActive,
                ]}
              />
              <Text
                style={[
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 18,
    backgroundColor: theme.colors.surface,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  healthDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: theme.colors.green700,
  },
  headerAction: {
    color: theme.colors.green700,
    fontSize: 9,
    fontWeight: "900",
  },
  body: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tabs: {
    minHeight: 72,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tabMark: {
    width: 18,
    height: 3,
    borderRadius: 99,
    backgroundColor: theme.colors.surfaceStrong,
  },
  tabMarkActive: {
    backgroundColor: theme.colors.green800,
  },
  tabLabel: {
    color: theme.colors.inkSubtle,
    fontSize: 9,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: theme.colors.green800,
  },
});
