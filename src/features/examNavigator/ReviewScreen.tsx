import { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { AppColors } from '@/src/core/theme/colors';
import { Mode } from '@/src/core/config/constants';
import { useAppStore } from '@/src/store/useAppStore';
import { checkQuestionsExist } from '@/src/data/db/questionService';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Review'>;

export default function ReviewScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const subject = useAppStore((s) => s.subject);
  const year = useAppStore((s) => s.year);
  const chapter = useAppStore((s) => s.chapter);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const streamColor = stream === 'natural' ? AppColors.natural : AppColors.social;

  const checkAndStart = useCallback(async () => {
    const exists = await checkQuestionsExist({
      stream: stream!,
      subject: subject!,
      year: year!,
      chapter: chapter!,
    });
    if (!exists) {
      setShowDownloadModal(true);
      return;
    }
    navigation.navigate('Quiz', { subject: subject!, year: year!, chapter: chapter! });
  }, [navigation, stream, subject, year, chapter]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: streamColor }]}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrowText}>{'← Back'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Review & Start</Text>
          <Text style={styles.headerSubtitle}>Step 4 of 4</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subject</Text>
          <Text style={styles.summaryValue}>{subject}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Year</Text>
          <Text style={styles.summaryValue}>{year}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Chapter</Text>
          <Text style={styles.summaryValue}>{chapter}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Mode</Text>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === Mode.Practice && { backgroundColor: streamColor }]}
          onPress={() => setMode(Mode.Practice)}
        >
          <Text style={[styles.modeText, mode === Mode.Practice && { color: AppColors.textLight }]}>
            Practice
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === Mode.Exam && { backgroundColor: streamColor }]}
          onPress={() => setMode(Mode.Exam)}
        >
          <Text style={[styles.modeText, mode === Mode.Exam && { color: AppColors.textLight }]}>
            Exam
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.startBtn, { backgroundColor: streamColor }]} onPress={checkAndStart}>
        <Text style={styles.startText}>
          {mode === Mode.Practice ? 'Start Practice' : 'Start Exam'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showDownloadModal} transparent animationType="fade" onRequestClose={() => setShowDownloadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Download Required</Text>
            <Text style={styles.modalBody}>
              No questions found for{'\n'}
              {subject} · {year} · Chapter {chapter}.{'\n\n'}
              Download the question package to continue.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: streamColor }]}
              onPress={() => setShowDownloadModal(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
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
  summaryCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: AppColors.textMuted,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.text,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.divider,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.text,
    marginLeft: 16,
    marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 14,
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
  startBtn: {
    margin: 16,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  startText: {
    color: AppColors.textLight,
    fontSize: 17,
    fontWeight: '700',
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
  modalBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 48,
  },
  modalBtnText: {
    color: AppColors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
});
