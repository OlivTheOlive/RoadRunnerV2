// Home.js
import React from "react";
import { StyleSheet, View, Button, Text } from "react-native";

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button title="GO" onPress={() => navigation.navigate("Tracking")} />
      <View style={styles.dailyReview}>
        <Text style={styles.header}>Daily Review</Text>
        {/* Placeholder for daily review of activity */}
        <Text>No activity recorded for today.</Text>
      </View>
      <View style={styles.oldActivities}>
        <Text style={styles.header}>Old Activities</Text>
        {/* Placeholder for old activities */}
        <Text>No old activities available.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dailyReview: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  oldActivities: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default Home;
