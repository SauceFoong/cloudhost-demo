import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import BottomTabNavigator from './BottomTabNavigator';
import SignupScreen from '../screens/SignupScreen';
import DepositScreen from '../screens/DepositScreen';
import CreateInstanceScreen from '../screens/CreateInstanceScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Signup: undefined;
  Deposit: undefined;
  CreateInstance: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundDark },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="CreateInstance" component={CreateInstanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

