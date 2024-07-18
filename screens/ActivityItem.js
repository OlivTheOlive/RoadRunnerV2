import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const ActivityItem = ({ activity, onDelete }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://192.168.86.22:3033/api/activity/${activity.id}`
      );
      onDelete(activity.id);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{activity.name}</Text>
      <Text style={styles.text}>
        Distance:{" "}
        {activity.distanceMeter < 1000
          ? activity.distanceMeter.toFixed(2) + " m"
          : activity.distanceInKm + " km"}
      </Text>
      <Text style={styles.text}>
        Average Speed: {activity.averageSpeedKM} km/h
      </Text>
      <Text style={styles.text}>
        Timestamp: {new Date(activity.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.text}>Duration: {activity.duration}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ActivityItem;
