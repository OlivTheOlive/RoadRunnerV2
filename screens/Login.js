// Login.js
import React from "react";
import { StyleSheet, View, Button } from "react-native";

const Login = ({ navigation }) => {
  const handleLogin = () => {
    // Placeholder for data fetching from Node server
    console.log("Fetching data from Node server...");

    // Simulate a delay for data fetching
    setTimeout(() => {
      // Navigate to Home screen
      navigation.navigate("Home");
    }, 100);
  };

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Login;
