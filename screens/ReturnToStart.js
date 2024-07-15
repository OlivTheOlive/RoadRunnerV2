// ReturnToStart.js
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, Dimensions } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import polyline from "@mapbox/polyline";

const ReturnToStart = ({ route, navigation }) => {
  const { startCoordinates } = route.params;
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const origin = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const destination = startCoordinates;
      const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`
        );

        const points = response.data.routes[0].overview_polyline.points;
        const decodedRoute = polyline.decode(points).map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setRouteCoordinates(decodedRoute);
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    })();
  }, []);

  const handleSaveActivity = () => {
    // Placeholder for saving the completed activity
    console.log("Activity saved");
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentPosition ? currentPosition.latitude : 37.7749,
          longitude: currentPosition ? currentPosition.longitude : -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text>Returning to Start...</Text>
        <Button title="Save Activity" onPress={handleSaveActivity} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.75,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
});

export default ReturnToStart;
