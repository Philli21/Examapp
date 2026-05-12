import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { AppColors } from '@/src/core/theme/colors';
import {
  SUBJECTS_NATURAL,
  SUBJECTS_SOCIAL,
  SHARED_SUBJECTS,
} from '@/src/core/config/constants';
import { useAppStore } from '@/src/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Navigator'>;

export default function SubjectPickerScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const subject = useAppStore((s) => s.subject);
  const setSubject = useAppStore((s) => s.setSubject);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const subjects: readonly string[] = useMemo(() => {
    if (stream === 'natural') return [...SUBJECTS_NATURAL, ...SHARED_SUBJECTS];
    if (stream === 'social') return [...SUBJECTS_SOCIAL, ...SHARED_SUBJECTS];
    return [];
  }, [stream]);

  const streamColor = stream === 'natural' ? AppColors.natural : AppColors.social;
  const streamLabel = stream === 'natural' ? 'Natural Science' : 'Social Science';

  const handleSelect = (item: string) => {
    setSubject(item);
    navigation.navigate('YearPicker');
  };

  const handleBack = () => {
    resetFilters();
    navigation.replace('StreamSelect');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: streamColor }]}>
        <Text style={styles.headerTitle}>{streamLabel}</Text>
        <Text style={styles.headerSubtitle}>Step 1 of 4 — Select Subject</Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const selected = subject === item;
          return (
            <TouchableOpacity
              style={[
                styles.subjectCard,
                selected && { borderColor: streamColor, borderWidth: 2 },
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[styles.cardText, selected && { color: streamColor, fontWeight: '700' }]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>Change Stream</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: AppColors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingVertical: 22,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
