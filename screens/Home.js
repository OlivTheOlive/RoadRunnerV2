import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ActivityItem from "./ActivityItem"; // Make sure to adjust the path as needed

const Home = ({ navigation }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      // Replace 'localhost' with your machine's IP address
      const response = await axios.get(
        // "http://192.168.86.22:3033/api/activity/"
        "http://172.20.10.2:3033/api/activity/"
      );

      // Directly access the data from response.data
      const data = response.data;
      console.log(data);
      setHistory(data);
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchActivities();
    }, [])
  );

  const handleDelete = (id) => {
    setHistory((prevHistory) =>
      prevHistory.filter((activity) => activity.id !== id)
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.goButton}
        onPress={() => navigation.navigate("Tracking")}
      >
        <Text style={styles.goButtonText}>GO</Text>
      </TouchableOpacity>
      <View style={styles.oldActivities}>
        <Text style={styles.header}>Activities</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : history ? (
          <ScrollView contentContainerStyle={styles.scrollView}>
            {history.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onDelete={handleDelete}
              />
            ))}
          </ScrollView>
        ) : (
          <Text>No old activities available.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ebebeb",
  },
  goButton: {
    backgroundColor: "#19bf00",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 10,
  },
  goButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  oldActivities: {
    flex: 1,
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    minHeight: 200, // Minimum height for smaller lists
    maxHeight: "80%", // Maximum height to prevent overflow
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollView: {
    paddingBottom: 20, // Ensure some padding at the bottom for better scrolling experience
  },
});

export default Home;
