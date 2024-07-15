import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Button, Dimensions } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import * as Location from "expo-location";

const Tracking = ({ navigation }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tracking, setTracking] = useState(true);
  const locationSubscriptionRef = useRef(null);

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

      startTracking();
    })();

    return () => {
      // Cleanup subscription on unmount
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  const startTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude, speed, heading } = location.coords;
          setRouteCoordinates((prevCoords) => [
            ...prevCoords,
            { latitude, longitude, speed, heading },
          ]);
          setCurrentPosition({ latitude, longitude });
        }
      );
      locationSubscriptionRef.current = subscription;
    } catch (error) {
      console.error("Error starting location tracking:", error);
    }
  };

  const stopTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    setTracking(false);
    navigation.navigate("ActivityResult", { routeCoordinates });
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
            coordinates={routeCoordinates.map(({ latitude, longitude }) => ({
              latitude,
              longitude,
            }))}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text>
          Speed:{" "}
          {currentPosition
            ? routeCoordinates[routeCoordinates.length - 1]?.speed
            : 0}{" "}
          m/s
        </Text>
        <Text>
          Direction:{" "}
          {currentPosition
            ? routeCoordinates[routeCoordinates.length - 1]?.heading
            : 0}{" "}
          degrees
        </Text>
        <Button title="Stop" onPress={stopTracking} />
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

export default Tracking;
