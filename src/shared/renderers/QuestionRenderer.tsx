import { useCallback, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Katex from 'react-native-katex';
import { SvgUri } from 'react-native-svg';

import type { Question, Option } from '@/src/data/db/questionService';
import { parseTextSegments, renderTextWithLatex } from './latexUtils';

interface QuestionRendererProps {
  question: Question;
  selectedOption: string | null;
  showFeedback: boolean;
  onSelectOption: (label: string) => void;
}

interface ImageMeta {
  path: string;
  width?: number;
  height?: number;
  type?: string;
}

export default function QuestionRenderer({
  question,
  selectedOption,
  showFeedback,
  onSelectOption,
}: QuestionRendererProps) {
  const segments = useMemo(() => parseTextSegments(question.question_text), [question.question_text]);

  const images: ImageMeta[] = useMemo(() => {
    try {
      return JSON.parse(question.question_images_json);
    } catch {
      return [];
    }
  }, [question.question_images_json]);

  const correctLabel = useMemo(() => {
    if (!question.options) return null;
    const correct = question.options.find((o) => o.is_correct === 1);
    return correct ? correct.label : null;
  }, [question.options]);

  const getOptionStyle = useCallback(
    (option: Option) => {
      const isSelected = selectedOption === option.label;
      const isCorrect = option.is_correct === 1;

      if (showFeedback) {
        if (isSelected && isCorrect) return styles.optionCorrect;
        if (isSelected && !isCorrect) return styles.optionWrong;
        if (isCorrect) return styles.optionCorrect;
      }

      if (isSelected) return styles.optionSelected;

      return styles.optionDefault;
    },
    [selectedOption, showFeedback],
  );

  const handlePress = useCallback(
    (label: string) => {
      if (showFeedback) return;
      onSelectOption(label);
    },
    [showFeedback, onSelectOption],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>
          {question.subject} · Ch.{question.chapter} · {question.year}
        </Text>
        <View style={styles.questionTextContainer}>
          {renderTextWithLatex(segments, styles.questionText)}
        </View>
      </View>

      {images.length > 0 && (
        <View style={styles.imageContainer}>
          {images.map((img, i) =>
            img.type === 'svg' || (img.path && img.path.endsWith('.svg')) ? (
              <SvgUri key={i} uri={img.path} width={img.width ?? 300} height={img.height ?? 200} />
            ) : (
              <Image
                key={i}
                source={{ uri: img.path }}
                style={{
                  width: img.width ?? 300,
                  height: img.height ?? 200,
                  resizeMode: 'contain',
                }}
              />
            ),
          )}
        </View>
      )}

      <View style={styles.optionsContainer}>
        {question.options?.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.optionCard, getOptionStyle(option)]}
            onPress={() => handlePress(option.label)}
          >
            <View style={styles.optionLabelContainer}>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </View>
            <View style={styles.optionTextContainer}>
              {renderTextWithLatex(parseTextSegments(option.option_text), styles.optionText)}
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionNumber: {
    fontSize: 14,
    color: '#999',
    marginBottom: 14,
  },
  questionText: {
    fontSize: 18,
    color: '#1A1A1A',
    lineHeight: 28,
    marginBottom: 4,
  },
  questionTextContainer: {
    // LaTeX and text segments stack vertically
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  optionsContainer: {},
  optionCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 10,
    minHeight: 52,
  },
  optionDefault: {},
  optionSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  optionCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionWrong: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionLabelContainer: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  optionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  optionTextContainer: {
    flex: 1,
    padding: 14,
  },
  optionText: {
    fontSize: 17,
    color: '#1A1A1A',
    lineHeight: 26,
  },
});
