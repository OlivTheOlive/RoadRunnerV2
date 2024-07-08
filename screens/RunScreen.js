import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Dimensions, Button } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const LocationTracker = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const API_ROUTE = "AIzaSyB7z721eM3cw5H4k7KxZENIAUVL67UxaY4";
  const locationSubscriptionRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Permission status:", status);
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (tracking) {
      console.log("Tracking started");
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          console.log("Current location:", latitude, longitude);
          setRouteCoordinates((prevCoords) => [
            ...prevCoords,
            { latitude, longitude },
          ]);
          setCurrentPosition({ latitude, longitude });
        }
      ).then((subscription) => {
        locationSubscriptionRef.current = subscription;
      });
    } else {
      console.log("Tracking stopped");
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    }

    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, [tracking]);

  const handleStartTracking = () => {
    console.log("Start button clicked");
    setTracking(true);
  };

  const handleStopTracking = () => {
    console.log("Stop button clicked");
    setTracking(false);
  };

  const handleReturnToStart = async () => {
    console.log("Return to Start button clicked");
    if (routeCoordinates.length === 0) {
      console.log("No route coordinates available");
      return;
    }

    const origin = routeCoordinates[routeCoordinates.length - 1];
    const destination = routeCoordinates[0];
    const apiKey = API_ROUTE;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`
      );

      console.log("API response:", response.data);

      if (response.data.routes.length === 0) {
        console.log("No routes found in the API response");
        return;
      }

      const points = response.data.routes[0].overview_polyline.points;
      console.log("Polyline points:", points);

      const decodedRoute = decodePolyline(points);

      console.log("Decoded route:", decodedRoute);

      setRouteCoordinates((prevCoords) => [...prevCoords, ...decodedRoute]);
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const decodePolyline = (t) => {
    let points = [];
    let index = 0,
      len = t.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    console.log("Decoded polyline points:", points);
    return points;
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
      <View style={styles.buttonContainer}>
        <Button title="Start" onPress={handleStartTracking}></Button>
        <Button title="Stop" onPress={handleStopTracking}></Button>
        <Button title="Return to Start" onPress={handleReturnToStart}></Button>
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
    height: Dimensions.get("window").height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
});

export default LocationTracker;
