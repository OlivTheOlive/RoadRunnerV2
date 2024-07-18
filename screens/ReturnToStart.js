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
import axios from "axios";
import polyline from "@mapbox/polyline";

const ReturnToStart = ({ route, navigation }) => {
  const { startCoordinates } = route.params;
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapViewRef = useRef(null);

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

      const origin = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const destination = startCoordinates;
      const apiKey = "AIzaSyB7z721eM3cw5H4k7KxZENIAUVL67UxaY4";

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

        if (mapViewRef.current) {
          mapViewRef.current.fitToCoordinates(decodedRoute, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
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
        ref={mapViewRef}
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
        <TouchableOpacity style={styles.button} onPress={handleSaveActivity}>
          <Text style={styles.buttonText}>Save Activity</Text>
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
    backgroundColor: "rgba(0, 122, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerText: {
    color: "#fff",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReturnToStart;
