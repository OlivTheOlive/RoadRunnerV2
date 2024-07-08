import React from "react";
import { StyleSheet, View } from "react-native";
import RunScreen from "./screens/RunScreen";
export default function App() {
  return (
    <View style={styles.container}>
      <RunScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
