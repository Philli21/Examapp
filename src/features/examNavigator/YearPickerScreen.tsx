import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { AppColors } from '@/src/core/theme/colors';
import { UPCOMING_YEARS } from '@/src/core/config/constants';
import { useAppStore } from '@/src/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'YearPicker'>;

interface YearItem {
  value: number;
  label: string;
  disabled: boolean;
  note: string | null;
}

const YEARS: YearItem[] = [
  { value: 2014, label: '2014', disabled: false, note: 'Legacy Curriculum' },
  { value: 2015, label: '2015', disabled: false, note: null },
  { value: 2016, label: '2016', disabled: false, note: null },
  { value: 2017, label: '2017', disabled: false, note: null },
  { value: 2018, label: '2018', disabled: true, note: 'Coming Soon' },
  ...UPCOMING_YEARS.filter((y) => y > 2018).map((y) => ({
    value: y,
    label: `${y}`,
    disabled: true,
    note: 'Coming Soon',
  })),
];

export default function YearPickerScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);

  const streamColor = stream === 'natural' ? AppColors.natural : AppColors.social;

  const handleSelect = (item: YearItem) => {
    if (item.disabled) return;
    setYear(item.value);
    navigation.navigate('ChapterPicker');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: streamColor }]}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrowText}>{'← Back'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Select Year</Text>
          <Text style={styles.headerSubtitle}>Step 2 of 4 — Exam Year</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {YEARS.map((item) => {
          const selected = year === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.yearCard,
                item.disabled && styles.yearDisabled,
                selected && { borderColor: streamColor, borderWidth: 2 },
              ]}
              disabled={item.disabled}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[
                  styles.yearValue,
                  selected && { color: streamColor },
                  item.disabled && { color: AppColors.disabled },
                ]}
              >
                {item.label}
              </Text>
              {item.note && (
                <Text
                  style={[
                    styles.yearNote,
                    item.disabled && { color: AppColors.disabled },
                    !item.disabled && { color: AppColors.warning },
                  ]}
                >
                  {item.note}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  backArrow: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  backArrowText: {
    color: AppColors.textLight,
    fontSize: 15,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 60,
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
  yearCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  yearDisabled: {
    backgroundColor: AppColors.yearDisabled,
    opacity: 0.6,
  },
  yearValue: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.text,
  },
  yearNote: {
    fontSize: 12,
    fontWeight: '600',
  },
});
