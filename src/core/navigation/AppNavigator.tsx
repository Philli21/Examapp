import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppStore } from '@/src/store/useAppStore';
import StreamSelectScreen from '@/src/screens/StreamSelectScreen';
import NavigatorScreen from '@/src/screens/NavigatorScreen';
import QuizScreen from '@/src/screens/QuizScreen';
import ResultsScreen from '@/src/screens/ResultsScreen';
import NotesScreen from '@/src/screens/NotesScreen';
import SettingsScreen from '@/src/screens/SettingsScreen';

export type RootStackParamList = {
  StreamSelect: undefined;
  Navigator: undefined;
  Quiz: { subject: string; year: number; chapter: number };
  Results: { sessionId: number };
  Notes: { questionId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const stream = useAppStore((s) => s.stream);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={stream ? 'Navigator' : 'StreamSelect'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="StreamSelect" component={StreamSelectScreen} />
        <Stack.Screen name="Navigator" component={NavigatorScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
