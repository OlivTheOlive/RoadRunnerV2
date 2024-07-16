// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Tracking from "./screens/Tracking";
import ActivityResult from "./screens/ActivityResult";
import ReturnToStart from "./screens/ReturnToStart";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerLeft: null }}
        />
        <Stack.Screen
          name="Tracking"
          component={Tracking}
          options={{ headerLeft: null }}
        />
        <Stack.Screen
          name="ActivityResult"
          component={ActivityResult}
          options={{ headerLeft: null }}
        />
        <Stack.Screen
          name="ReturnToStart"
          component={ReturnToStart}
          options={{ headerLeft: null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
