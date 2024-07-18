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
  // Extract startCoordinates from route parameters
  const { startCoordinates } = route.params;

  // State to store the current position of the user
  const [currentPosition, setCurrentPosition] = useState(null);

  // State to store the route coordinates
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // State to store the arrows for the route
  const [arrows, setArrows] = useState([]);

  // Reference to the MapView
  const mapViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      // Get the current location
      let location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || 0,
      });

      const origin = `${location.coords.latitude},${location.coords.longitude}`;
      const destination = `${startCoordinates.latitude},${startCoordinates.longitude}`;

      try {
        // Fetch directions from the server
        const response = await axios.get(
          // `http://192.168.86.22:3033/api/activity/directions?origin=${origin}&destination=${destination}`
          `http://172.20.10.2:3033/api/activity/directions?origin=${origin}&destination=${destination}`
        );

        // Decode the polyline points
        const points = response.data.routes[0].overview_polyline.points;
        const decodedRoute = polyline.decode(points).map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        // Set the route coordinates and arrows
        setRouteCoordinates(decodedRoute);
        setArrows(generateArrows(decodedRoute));

        // Fit the map to the coordinates
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

  // Generate arrows along the route
  const generateArrows = (coordinates) => {
    const arrowInterval = 5; // distance between arrows in coordinates
    let arrowsArray = [];

    for (let i = 0; i < coordinates.length - 1; i += arrowInterval) {
      const start = coordinates[i];
      const end =
        coordinates[
          i + arrowInterval < coordinates.length
            ? i + arrowInterval
            : coordinates.length - 1
        ];
      const angle =
        Math.atan2(
          end.latitude - start.latitude,
          end.longitude - start.longitude
        ) *
        (180 / Math.PI);

      arrowsArray.push({
        coordinate: start,
        angle,
      });
    }

    return arrowsArray;
  };

  // Handle saving the activity and navigating to the home page
  const handleSaveActivity = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: currentPosition ? currentPosition.latitude : 45.4215,
          longitude: currentPosition ? currentPosition.longitude : -75.6972,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
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
        {arrows.map((arrow, index) => (
          <Marker
            key={index}
            coordinate={arrow.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{ transform: [{ rotate: `${arrow.angle}deg` }] }}
          >
            <Text style={styles.arrow}>➤</Text>
          </Marker>
        ))}
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
          <Text style={styles.buttonText}>Home Page</Text>
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
  arrow: {
    fontSize: 24,
    color: "blue",
  },
});

export default ReturnToStart;
