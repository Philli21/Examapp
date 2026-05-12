import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { useAppStore } from '@/src/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Navigator'>;

export default function NavigatorScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const subject = useAppStore((s) => s.subject);
  const year = useAppStore((s) => s.year);
  const chapter = useAppStore((s) => s.chapter);
  const mode = useAppStore((s) => s.mode);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const handleReset = () => {
    resetFilters();
    navigation.replace('StreamSelect');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigator</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Stream: {stream ?? 'not set'}</Text>
        <Text style={styles.label}>Subject: {subject ?? 'not set'}</Text>
        <Text style={styles.label}>Year: {year ?? 'not set'}</Text>
        <Text style={styles.label}>Chapter: {chapter ?? 'not set'}</Text>
        <Text style={styles.label}>Mode: {mode}</Text>
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: '#e53935',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
