// ActivityResult.js
import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";

const ActivityResult = ({ route, navigation }) => {
  const { routeCoordinates } = route.params;

  const handleSaveActivity = () => {
    // Placeholder for sending data to Node server
    console.log("Saving activity to Node server:", routeCoordinates);
    navigation.navigate("Home");
  };

  const handleReturnToStart = () => {
    navigation.navigate("ReturnToStart", {
      startCoordinates: routeCoordinates[0],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <Text>Activity Summary:</Text>
        <Text>Distance: {routeCoordinates.length * 1} meters</Text>
        <Text>
          Speed:{" "}
          {routeCoordinates.length > 0
            ? routeCoordinates[routeCoordinates.length - 1].speed
            : 0}{" "}
          m/s
        </Text>
        <Text>
          Direction:{" "}
          {routeCoordinates.length > 0
            ? routeCoordinates[routeCoordinates.length - 1].heading
            : 0}{" "}
          degrees
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={handleSaveActivity} />
        <Button title="Return to Start" onPress={handleReturnToStart} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default ActivityResult;
