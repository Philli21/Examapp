import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { AppColors } from '@/src/core/theme/colors';
import { CHAPTERS } from '@/src/core/config/constants';
import { useAppStore } from '@/src/store/useAppStore';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ChapterPicker'>;

export default function ChapterPickerScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const chapter = useAppStore((s) => s.chapter);
  const setChapter = useAppStore((s) => s.setChapter);

  const streamColor = stream === 'natural' ? AppColors.natural : AppColors.social;

  const handleSelect = (ch: number) => {
    setChapter(ch);
    navigation.navigate('Review');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: streamColor }]}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrowText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Select Chapter</Text>
          <Text style={styles.headerSubtitle}>Step 3 of 4 - Choose Chapter</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
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
              onPress={() => handleSelect(ch)}
            >
              <Text
                style={[
                  styles.chapterNumber,
                  selected && { color: AppColors.textLight },
                ]}
              >
                {ch}
              </Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'center',
  },
  chapterCard: {
    width: 72,
    height: 72,
    borderRadius: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text,
  },
});
