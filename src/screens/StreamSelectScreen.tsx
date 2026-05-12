import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { useAppStore } from '@/src/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'StreamSelect'>;

export default function StreamSelectScreen() {
  const navigation = useNavigation<Navigation>();
  const setStream = useAppStore((s) => s.setStream);

  const handleSelect = (stream: 'natural' | 'social') => {
    setStream(stream);
    navigation.replace('Navigator');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Stream</Text>

      <TouchableOpacity
        style={[styles.button, styles.naturalButton]}
        onPress={() => handleSelect('natural')}
      >
        <Text style={styles.buttonText}>Natural Science</Text>
        <Text style={styles.subText}>Physics · Chemistry · Biology</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.socialButton]}
        onPress={() => handleSelect('social')}
      >
        <Text style={styles.buttonText}>Social Science</Text>
        <Text style={styles.subText}>History · Geography · Economics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#1a1a1a',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  naturalButton: {
    backgroundColor: '#1565c0',
  },
  socialButton: {
    backgroundColor: '#2e7d32',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
});
