import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";

const Tracking = ({ navigation }) => {
  // State to store the coordinates of the route
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  // State to store the current position of the user
  const [currentPosition, setCurrentPosition] = useState(null);
  // Reference to store the location subscription
  const locationSubscriptionRef = useRef(null);
  // Reference to the MapView
  const mapViewRef = useRef(null);
  // Reference to store the start time of the tracking
  const startTime = useRef(new Date());

  useEffect(() => {
    // Function to request permissions and fetch the current location
    const requestPermissionsAndFetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || 0,
      });

      // Start tracking the location
      startTracking();
    };

    requestPermissionsAndFetchLocation();

    return () => {
      // Cleanup subscription on unmount
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  // Function to start tracking the location
  const startTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 100,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude, speed, heading } = location.coords;
          setRouteCoordinates((prevCoords) => [
            ...prevCoords,
            { latitude, longitude, speed, heading },
          ]);
          setCurrentPosition({ latitude, longitude, heading });

          mapViewRef.current?.animateCamera({
            center: { latitude, longitude },
            heading: heading || 0,
            pitch: 0,
            zoom: 18,
          });
        }
      );
      locationSubscriptionRef.current = subscription;
    } catch (error) {
      console.error("Error starting location tracking:", error);
    }
  };

  // Function to stop tracking the location
  const stopTracking = () => {
    locationSubscriptionRef.current?.remove();
    const endTime = new Date();
    navigation.navigate("ActivityResult", {
      routeCoordinates,
      startTime: startTime.current.toISOString(),
      endTime: endTime.toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: currentPosition?.latitude || 45.4215,
          longitude: currentPosition?.longitude || -75.6972, // default lat long for Ottawa
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
        showsUserLocation={false}
        followsUserLocation={false}
      >
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            rotation={currentPosition.heading}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>🏃</Text>
            </View>
          </Marker>
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text>
          Speed:{" "}
          {routeCoordinates.length > 0
            ? (
                routeCoordinates[routeCoordinates.length - 1].speed * 3.6
              ).toFixed(2)
            : 0}{" "}
          km/h
        </Text>
        <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
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
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  markerText: {
    color: "#fff",
    fontSize: 18,
  },
  stopButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 10,
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Tracking;
