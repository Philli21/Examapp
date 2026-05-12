import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { AppColors } from '@/src/core/theme/colors';
import {
  SUBJECTS_NATURAL,
  SUBJECTS_SOCIAL,
  SHARED_SUBJECTS,
  YEARS,
  UPCOMING_YEARS,
  CHAPTERS,
  Mode,
} from '@/src/core/config/constants';
import { useAppStore } from '@/src/store/useAppStore';
import { getDatabase } from '@/src/data/db/dbService';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Navigator'>;

interface YearOption {
  value: number;
  label: string;
  disabled: boolean;
}

const YEAR_OPTIONS: YearOption[] = [
  { value: 2014, label: '2014 (Legacy)', disabled: false },
  { value: 2015, label: '2015', disabled: false },
  { value: 2016, label: '2016', disabled: false },
  { value: 2017, label: '2017', disabled: false },
  { value: 2018, label: '2018 (Coming Soon)', disabled: true },
  ...UPCOMING_YEARS.filter((y) => y > 2018).map((y) => ({
    value: y,
    label: `${y} (Coming Soon)`,
    disabled: true,
  })),
];

export default function NavigatorScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const subject = useAppStore((s) => s.subject);
  const year = useAppStore((s) => s.year);
  const chapter = useAppStore((s) => s.chapter);
  const mode = useAppStore((s) => s.mode);
  const setSubject = useAppStore((s) => s.setSubject);
  const setYear = useAppStore((s) => s.setYear);
  const setChapter = useAppStore((s) => s.setChapter);
  const setMode = useAppStore((s) => s.setMode);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const subjects: readonly string[] = useMemo(() => {
    if (stream === 'natural') {
      return [...SUBJECTS_NATURAL, ...SHARED_SUBJECTS];
    }
    if (stream === 'social') {
      return [...SUBJECTS_SOCIAL, ...SHARED_SUBJECTS];
    }
    return [];
  }, [stream]);

  const canStart = subject !== null && year !== null && chapter !== null;

  const checkQuestionsExist = useCallback(async () => {
    if (!canStart) return false;
    try {
      const db = getDatabase();
      const result = await db.execute(
        'SELECT COUNT(*) as count FROM questions WHERE subject = ? AND year = ? AND chapter = ?',
        [subject!, year!, chapter!],
      );
      const row = (result.rows as Array<{ count: number }>)[0];
      return row.count > 0;
    } catch {
      return false;
    }
  }, [canStart, subject, year, chapter]);

  const handleStart = useCallback(async () => {
    const questionsExist = await checkQuestionsExist();
    if (!questionsExist) {
      setShowDownloadModal(true);
      return;
    }
    navigation.navigate('Quiz', {
      subject: subject!,
      year: year!,
      chapter: chapter!,
    });
  }, [checkQuestionsExist, navigation, subject, year, chapter]);

  const handleReset = useCallback(() => {
    resetFilters();
    navigation.replace('StreamSelect');
  }, [resetFilters, navigation]);

  const streamColor = stream === 'natural' ? AppColors.natural : AppColors.social;
  const streamLabel = stream === 'natural' ? 'Natural Science' : 'Social Science';

  return (
    <View style={styles.container}>
      <View style={[styles.streamBadge, { backgroundColor: streamColor }]}>
        <Text style={styles.streamBadgeText}>{streamLabel}</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Subject Section ─── */}
        <Text style={styles.sectionTitle}>Subject</Text>
        <FlatList
          data={subjects}
          keyExtractor={(item) => item}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.subjectRow}
          renderItem={({ item }) => {
            const selected = subject === item;
            return (
              <TouchableOpacity
                style={[
                  styles.subjectCard,
                  selected && { borderColor: streamColor, borderWidth: 2 },
                ]}
                onPress={() => setSubject(item)}
              >
                <Text
                  style={[
                    styles.subjectText,
                    selected && { color: streamColor, fontWeight: '700' },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* ─── Year Section ─── */}
        <Text style={styles.sectionTitle}>Year</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {YEAR_OPTIONS.map((opt) => {
            const selected = year === opt.value;
            const chipBg: string = opt.disabled
              ? AppColors.yearDisabled
              : selected
              ? streamColor
              : opt.value === 2014
              ? AppColors.yearLegacy
              : AppColors.surface;
            const chipTextColor: string =
              selected && !opt.disabled ? AppColors.textLight : opt.disabled ? AppColors.disabled : AppColors.text;

            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.yearChip, { backgroundColor: chipBg }]}
                disabled={opt.disabled}
                onPress={() => setYear(opt.value)}
              >
                <Text style={[styles.yearText, { color: chipTextColor }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Chapter Section ─── */}
        <Text style={styles.sectionTitle}>Chapter</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chapterRow}>
            {CHAPTERS.map((ch) => {
              const selected = chapter === ch;
              return (
                <TouchableOpacity
                  key={ch}
                  style={[
                    styles.chapterCard,
                    selected
                      ? { backgroundColor: streamColor }
                      : { backgroundColor: AppColors.chapterDefault },
                  ]}
                  onPress={() => setChapter(ch)}
                >
                  <Text
                    style={[
                      styles.chapterText,
                      selected && { color: AppColors.textLight },
                    ]}
                  >
                    {ch}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ─── Mode Toggle ─── */}
        <Text style={styles.sectionTitle}>Mode</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === Mode.Practice && { backgroundColor: streamColor },
            ]}
            onPress={() => setMode(Mode.Practice)}
          >
            <Text
              style={[
                styles.modeText,
                mode === Mode.Practice && { color: AppColors.textLight },
              ]}
            >
              Practice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === Mode.Exam && { backgroundColor: streamColor },
            ]}
            onPress={() => setMode(Mode.Exam)}
          >
            <Text
              style={[
                styles.modeText,
                mode === Mode.Exam && { color: AppColors.textLight },
              ]}
            >
              Exam
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Bottom Bar ─── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.startButton, !canStart && styles.startButtonDisabled]}
          disabled={!canStart}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>
            {mode === Mode.Practice ? 'Start Practice' : 'Start Exam'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleReset}>
          <Text style={styles.backButtonText}>Change Stream</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Download Required Modal ─── */}
      <Modal
        visible={showDownloadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDownloadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Download Required</Text>
            <Text style={styles.modalBody}>
              No questions found for{'\n'}
              {subject} · {year} · Chapter {chapter}.{'\n\n'}
              Please download the question package for this selection.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: streamColor }]}
              onPress={() => setShowDownloadModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  streamBadge: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  streamBadgeText: {
    color: AppColors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  subjectRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.text,
    textAlign: 'center',
  },
  yearChip: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.text,
  },
  chapterRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  chapterCard: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterText: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.text,
  },
  modeRow: {
    flexDirection: 'row',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
  startButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonDisabled: {
    backgroundColor: AppColors.disabled,
  },
  startButtonText: {
    color: AppColors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backButtonText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 48,
  },
  modalButtonText: {
    color: AppColors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
});
