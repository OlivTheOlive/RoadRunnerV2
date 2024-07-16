import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Button, Dimensions } from "react-native";
import MapView, { Polyline, Marker, AnimatedRegion } from "react-native-maps";
import * as Location from "expo-location";

const Tracking = ({ navigation }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tracking, setTracking] = useState(true);
  const locationSubscriptionRef = useRef(null);
  const mapViewRef = useRef(null);
  const startTime = useRef(new Date());

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
        heading: location.coords.heading || 0,
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
          setCurrentPosition({ latitude, longitude, heading });

          if (mapViewRef.current) {
            mapViewRef.current.animateCamera({
              center: { latitude, longitude },
              heading: heading || 0,
              pitch: 0,
              zoom: 18,
            });
          }
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
          latitude: currentPosition ? currentPosition.latitude : 37.7749,
          longitude: currentPosition ? currentPosition.longitude : -122.4194,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
        showsUserLocation={false}
        followsUserLocation={false}
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
        {currentPosition && (
          <Marker
            coordinate={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
            }}
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
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: "rgba(0, 122, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Tracking;
