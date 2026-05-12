import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppStore } from '@/src/store/useAppStore';
import StreamSelectScreen from '@/src/screens/StreamSelectScreen';
import SubjectPickerScreen from '@/src/features/examNavigator/SubjectPickerScreen';
import YearPickerScreen from '@/src/features/examNavigator/YearPickerScreen';
import ChapterPickerScreen from '@/src/features/examNavigator/ChapterPickerScreen';
import ReviewScreen from '@/src/features/examNavigator/ReviewScreen';
import QuizScreen from '@/src/screens/QuizScreen';
import ResultsScreen from '@/src/screens/ResultsScreen';
import NotesScreen from '@/src/screens/NotesScreen';
import SettingsScreen from '@/src/screens/SettingsScreen';

export type RootStackParamList = {
  StreamSelect: undefined;
  Navigator: undefined;
  YearPicker: undefined;
  ChapterPicker: undefined;
  Review: undefined;
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
        <Stack.Screen name="Navigator" component={SubjectPickerScreen} />
        <Stack.Screen name="YearPicker" component={YearPickerScreen} />
        <Stack.Screen name="ChapterPicker" component={ChapterPickerScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
