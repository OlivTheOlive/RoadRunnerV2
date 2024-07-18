import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import { getDistance } from "geolib";

const ActivityResult = ({ route, navigation }) => {
  const { routeCoordinates, startTime, endTime } = route.params;

  const periodsOfTime = [
    { period: "Early Morning", startHour: 0, endHour: 5 },
    { period: "Morning", startHour: 6, endHour: 11 },
    { period: "Afternoon", startHour: 12, endHour: 17 },
    { period: "Evening", startHour: 18, endHour: 20 },
    { period: "Late Evening", startHour: 21, endHour: 23 },
  ];

  const getPeriodOfTime = (date) => {
    const hours = date.getHours();
    const period = periodsOfTime.find(
      (p) => hours >= p.startHour && hours <= p.endHour
    );
    return period ? period.period : "Unknown Period";
  };

  const periodOfTime = getPeriodOfTime(new Date(startTime));
  const activityName = `${periodOfTime} Activity`;

  const calculateDistance = (coords) => {
    if (coords.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < coords.length; i++) {
      totalDistance += getDistance(
        {
          latitude: coords[i - 1].latitude,
          longitude: coords[i - 1].longitude,
        },
        { latitude: coords[i].latitude, longitude: coords[i].longitude }
      );
    }

    return totalDistance;
  };

  const calculateAverageSpeed = (coords) => {
    if (coords.length < 2) return 0;

    const totalDistance = calculateDistance(coords) / 1000; // distance in km
    const totalTime = (new Date(endTime) - new Date(startTime)) / 3600000; // time in hours

    return (totalDistance / totalTime).toFixed(2); // km/h
  };

  const getDuration = () => {
    const duration = (new Date(endTime) - new Date(startTime)) / 1000; // time in seconds
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const returnHome = async () => {
    handleSaveActivity();
    navigation.navigate("Home");
  };

  const handleSaveActivity = async () => {
    const totalDistance = calculateDistance(routeCoordinates);
    const distanceInKm = (totalDistance / 1000).toFixed(2);
    const averageSpeed = calculateAverageSpeed(routeCoordinates);

    const activityData = {
      name: activityName,
      distanceMeter: totalDistance,
      distanceInKm: parseFloat(distanceInKm),
      averageSpeedKM: parseFloat(averageSpeed),
      timestamp: new Date(startTime).toISOString(),
      duration: getDuration(),
    };

    try {
      const response = await axios.post(
        // "http://192.168.86.22:3033/api/activity/save",
        "http://172.20.10.2:3033/api/activity/save",
        activityData
      );
      console.log("Saving activity to Node server:", activityData);
      console.log(response.data.message);
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleReturnToStart = () => {
    handleSaveActivity();
    navigation.navigate("ReturnToStart", {
      startCoordinates: routeCoordinates[0],
    });
  };

  const totalDistance = calculateDistance(routeCoordinates);
  const distanceInKm = (totalDistance / 1000).toFixed(2);
  const averageSpeed = calculateAverageSpeed(routeCoordinates);

  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <Text style={styles.header}>Activity Summary</Text>
        <Text style={styles.text}>Name: {activityName}</Text>
        <Text style={styles.text}>
          Distance:{" "}
          {totalDistance.toFixed(2) < 1000
            ? totalDistance.toFixed(2) + " meters"
            : distanceInKm + " km"}
        </Text>
        <Text style={styles.text}>Average Speed: {averageSpeed} km/h</Text>
        <Text style={styles.text}>Duration: {getDuration()}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={returnHome}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReturnToStart}>
          <Text style={styles.buttonText}>Return to Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "20%",
    backgroundColor: "#f0f0f0",
  },
  resultContainer: {
    marginBottom: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ActivityResult;
