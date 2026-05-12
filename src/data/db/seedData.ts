import { executeTransaction } from './dbService';
import type { Transaction } from '@op-engineering/op-sqlite';

interface SeedQuestion {
  id: string;
  grade: number;
  stream: 'natural' | 'social' | 'shared';
  subject: string;
  year: number;
  chapter: number;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_sec: number;
  question_text: string;
  explanation_text: string;
  package_id: string;
  options: SeedOption[];
}

interface SeedOption {
  label: string;
  option_text: string;
  is_correct: 0 | 1;
}

const SEED_QUESTIONS: SeedQuestion[] = [
  // ═══════════════════════════════════════════
  // PHYSICS (4) — stream: natural
  // ═══════════════════════════════════════════
  {
    id: 'PHY_2017_CH1_Q01',
    grade: 12,
    stream: 'natural',
    subject: 'Physics',
    year: 2017,
    chapter: 1,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'A projectile is fired with an initial velocity \\( v_0 \\) at an angle \\( \\theta \\) above the horizontal. Neglecting air resistance, which expression gives the time of flight?',
    explanation_text:
      'The time of flight \\( T \\) is the total time the projectile spends in the air. The vertical component of initial velocity is \\( v_0 \\sin\\theta \\). Using \\( y = v_{0y} t - \\frac{1}{2} g t^2 \\) and setting \\( y = 0 \\) at landing: \\( 0 = v_0 \\sin\\theta \\, T - \\frac{1}{2} g T^2 \\) → \\( T = \\frac{2 v_0 \\sin\\theta}{g} \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( \\frac{v_0 \\sin\\theta}{g} \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( \\frac{2 v_0 \\sin\\theta}{g} \\)', is_correct: 1 },
      { label: 'C', option_text: '\\( \\frac{v_0 \\cos\\theta}{g} \\)', is_correct: 0 },
      { label: 'D', option_text: '\\( \\frac{2 v_0 \\cos\\theta}{g} \\)', is_correct: 0 },
    ],
  },
  {
    id: 'PHY_2017_CH2_Q02',
    grade: 12,
    stream: 'natural',
    subject: 'Physics',
    year: 2017,
    chapter: 2,
    difficulty: 'hard',
    time_limit_sec: 120,
    question_text:
      'An ideal gas undergoes an isothermal expansion at temperature \\( T = 300 \\, \\text{K} \\) from volume \\( V_1 = 2 \\, \\text{L} \\) to \\( V_2 = 8 \\, \\text{L} \\). If \\( n = 1 \\, \\text{mol} \\) and \\( R = 8.314 \\, \\text{J mol}^{-1} \\text{K}^{-1} \\), the work done by the gas is:',
    explanation_text:
      'For an isothermal process, \\( W = nRT \\ln\\frac{V_2}{V_1} \\). Substituting: \\( W = (1)(8.314)(300) \\ln\\frac{8}{2} = 2494.2 \\times \\ln 4 \\approx 2494.2 \\times 1.386 \\approx 3456 \\, \\text{J} \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( 1730 \\, \\text{J} \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( 2494 \\, \\text{J} \\)', is_correct: 0 },
      { label: 'C', option_text: '\\( 3456 \\, \\text{J} \\)', is_correct: 1 },
      { label: 'D', option_text: '\\( 4988 \\, \\text{J} \\)', is_correct: 0 },
    ],
  },
  {
    id: 'PHY_2017_CH3_Q03',
    grade: 12,
    stream: 'natural',
    subject: 'Physics',
    year: 2017,
    chapter: 3,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'Three resistors \\( R_1 = 2 \\, \\Omega \\), \\( R_2 = 3 \\, \\Omega \\), and \\( R_3 = 6 \\, \\Omega \\) are connected in parallel. The equivalent resistance \\( R_{\\text{eq}} \\) is:',
    explanation_text:
      'For resistors in parallel: \\( \\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3} = \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{6} = \\frac{3+2+1}{6} = \\frac{6}{6} = 1 \\). Therefore \\( R_{\\text{eq}} = 1 \\, \\Omega \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( 0.5 \\, \\Omega \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( 1 \\, \\Omega \\)', is_correct: 1 },
      { label: 'C', option_text: '\\( 11 \\, \\Omega \\)', is_correct: 0 },
      { label: 'D', option_text: '\\( 6 \\, \\Omega \\)', is_correct: 0 },
    ],
  },
  {
    id: 'PHY_2017_CH4_Q04',
    grade: 12,
    stream: 'natural',
    subject: 'Physics',
    year: 2017,
    chapter: 4,
    difficulty: 'hard',
    time_limit_sec: 120,
    question_text:
      'A string of length \\( L \\) is fixed at both ends and vibrates in its third harmonic. The distance between a node and the nearest antinode is:',
    explanation_text:
      'For a string fixed at both ends, the \\( n \\)th harmonic has wavelength \\( \\lambda_n = \\frac{2L}{n} \\). For the third harmonic (\\( n = 3 \\)), \\( \\lambda_3 = \\frac{2L}{3} \\). The distance between a node and the nearest antinode is \\( \\frac{\\lambda}{4} = \\frac{2L}{12} = \\frac{L}{6} \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( \\frac{L}{2} \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( \\frac{L}{3} \\)', is_correct: 0 },
      { label: 'C', option_text: '\\( \\frac{L}{4} \\)', is_correct: 0 },
      { label: 'D', option_text: '\\( \\frac{L}{6} \\)', is_correct: 1 },
    ],
  },

  // ═══════════════════════════════════════════
  // MATHS NATURAL (4) — stream: natural
  // ═══════════════════════════════════════════
  {
    id: 'MATH_2017_CH5_Q05',
    grade: 12,
    stream: 'natural',
    subject: 'Maths Natural',
    year: 2017,
    chapter: 5,
    difficulty: 'easy',
    time_limit_sec: 90,
    question_text:
      'Find the domain of the function \\( f(x) = \\sqrt{x^2 - 9} \\).',
    explanation_text:
      'The expression inside the square root must be non-negative: \\( x^2 - 9 \\geq 0 \\), so \\( x^2 \\geq 9 \\), giving \\( x \\leq -3 \\) or \\( x \\geq 3 \\). In interval notation: \\( (-\\infty, -3] \\cup [3, \\infty) \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( [-3, 3] \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( (-\\infty, -3] \\cup [3, \\infty) \\)', is_correct: 1 },
      { label: 'C', option_text: '\\( (-\\infty, \\infty) \\)', is_correct: 0 },
      { label: 'D', option_text: '\\( (-3, 3) \\)', is_correct: 0 },
    ],
  },
  {
    id: 'MATH_2017_CH6_Q06',
    grade: 12,
    stream: 'natural',
    subject: 'Maths Natural',
    year: 2017,
    chapter: 6,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'If \\( y = \\ln(\\sin x) \\) where \\( 0 < x < \\pi \\), then \\( \\frac{dy}{dx} \\) equals:',
    explanation_text:
      'Using the chain rule: \\( \\frac{dy}{dx} = \\frac{1}{\\sin x} \\cdot \\frac{d}{dx}(\\sin x) = \\frac{1}{\\sin x} \\cdot \\cos x = \\cot x \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( \\tan x \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( \\cot x \\)', is_correct: 1 },
      { label: 'C', option_text: '\\( \\csc x \\)', is_correct: 0 },
      { label: 'D', option_text: '\\( \\sec x \\)', is_correct: 0 },
    ],
  },
  {
    id: 'MATH_2017_CH7_Q07',
    grade: 12,
    stream: 'natural',
    subject: 'Maths Natural',
    year: 2017,
    chapter: 7,
    difficulty: 'medium',
    time_limit_sec: 120,
    question_text:
      'Evaluate the definite integral \\( \\displaystyle\\int_{0}^{\\pi} \\sin x \\, dx \\).',
    explanation_text:
      '\\( \\int \\sin x \\, dx = -\\cos x + C \\). Evaluating from \\( 0 \\) to \\( \\pi \\): \\( [-\\cos x]_{0}^{\\pi} = (-\\cos\\pi) - (-\\cos 0) = (-(-1)) - (-1) = 1 + 1 = 2 \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( 0 \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( 1 \\)', is_correct: 0 },
      { label: 'C', option_text: '\\( 2 \\)', is_correct: 1 },
      { label: 'D', option_text: '\\( -2 \\)', is_correct: 0 },
    ],
  },
  {
    id: 'MATH_2017_CH8_Q08',
    grade: 12,
    stream: 'natural',
    subject: 'Maths Natural',
    year: 2017,
    chapter: 8,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'Given vectors \\( \\vec{a} = 2\\hat{i} + 3\\hat{j} - \\hat{k} \\) and \\( \\vec{b} = \\hat{i} - 2\\hat{j} + 3\\hat{k} \\), the dot product \\( \\vec{a} \\cdot \\vec{b} \\) is:',
    explanation_text:
      '\\( \\vec{a} \\cdot \\vec{b} = (2)(1) + (3)(-2) + (-1)(3) = 2 - 6 - 3 = -7 \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '\\( 5 \\)', is_correct: 0 },
      { label: 'B', option_text: '\\( 1 \\)', is_correct: 0 },
      { label: 'C', option_text: '\\( -3 \\)', is_correct: 0 },
      { label: 'D', option_text: '\\( -7 \\)', is_correct: 1 },
    ],
  },

  // ═══════════════════════════════════════════
  // ENGLISH (4) — stream: shared
  // ═══════════════════════════════════════════
  {
    id: 'ENG_2017_CH9_Q09',
    grade: 12,
    stream: 'shared',
    subject: 'English',
    year: 2017,
    chapter: 9,
    difficulty: 'easy',
    time_limit_sec: 60,
    question_text:
      'Identify the tense used in the sentence: "She has been working at the hospital since 2012."',
    explanation_text:
      'The sentence uses "has been working," which combines the auxiliary verb "has" (present), "been" (past participle of be), and the present participle "working." This structure indicates the present perfect continuous tense, describing an action that started in the past and continues to the present.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Present perfect', is_correct: 0 },
      { label: 'B', option_text: 'Present perfect continuous', is_correct: 1 },
      { label: 'C', option_text: 'Past perfect', is_correct: 0 },
      { label: 'D', option_text: 'Past continuous', is_correct: 0 },
    ],
  },
  {
    id: 'ENG_2017_CH10_Q10',
    grade: 12,
    stream: 'shared',
    subject: 'English',
    year: 2017,
    chapter: 10,
    difficulty: 'medium',
    time_limit_sec: 60,
    question_text:
      'Select the word that is closest in meaning to "ubiquitous."',
    explanation_text:
      '"Ubiquitous" means present, appearing, or found everywhere. "Omnipresent" is the closest synonym among the choices. "Rare" is an antonym, while "temporary" and "visible" refer to different qualities.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Rare', is_correct: 0 },
      { label: 'B', option_text: 'Temporary', is_correct: 0 },
      { label: 'C', option_text: 'Omnipresent', is_correct: 1 },
      { label: 'D', option_text: 'Visible', is_correct: 0 },
    ],
  },
  {
    id: 'ENG_2017_CH11_Q11',
    grade: 12,
    stream: 'shared',
    subject: 'English',
    year: 2017,
    chapter: 11,
    difficulty: 'medium',
    time_limit_sec: 120,
    question_text:
      'Read the following excerpt: "The rapid expansion of urban centers across Ethiopia has placed unprecedented pressure on municipal infrastructure. Roads, water systems, and housing have struggled to keep pace with population inflows from rural areas."\n\nWhat is the main idea of this passage?',
    explanation_text:
      'The passage describes how urban growth is straining infrastructure in Ethiopian cities. The key phrases are "rapid expansion of urban centers" and "struggled to keep pace," which directly point to urbanization outpacing infrastructure development.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Rural populations are decreasing rapidly.', is_correct: 0 },
      { label: 'B', option_text: 'Urbanization is outpacing infrastructure development.', is_correct: 1 },
      { label: 'C', option_text: 'Water systems in cities are failing.', is_correct: 0 },
      { label: 'D', option_text: 'Rural areas have better infrastructure than cities.', is_correct: 0 },
    ],
  },
  {
    id: 'ENG_2017_CH12_Q12',
    grade: 12,
    stream: 'shared',
    subject: 'English',
    year: 2017,
    chapter: 12,
    difficulty: 'hard',
    time_limit_sec: 90,
    question_text:
      'Which of the following sentences is the most effective topic sentence for a paragraph about the benefits of renewable energy?',
    explanation_text:
      'A strong topic sentence should introduce the main idea clearly and set up supporting details. Option B states the broad benefits of renewable energy as a sustainable and cleaner alternative, which can then be supported with specific examples. The other options are either too narrow, a supporting detail, or a counterargument.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Solar panels are expensive to install.', is_correct: 0 },
      { label: 'B', option_text: 'Renewable energy offers a sustainable and cleaner alternative to fossil fuels.', is_correct: 1 },
      { label: 'C', option_text: 'Wind turbines can harm bird populations.', is_correct: 0 },
      { label: 'D', option_text: 'Many countries still rely heavily on coal power.', is_correct: 0 },
    ],
  },

  // ═══════════════════════════════════════════
  // APTITUDE (4) — stream: shared
  // ═══════════════════════════════════════════
  {
    id: 'APT_2017_CH13_Q13',
    grade: 12,
    stream: 'shared',
    subject: 'Aptitude',
    year: 2017,
    chapter: 13,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'Consider the following statements:\n1. All doctors are graduates.\n2. Some graduates are researchers.\n\nWhich conclusion logically follows?',
    explanation_text:
      'From "All doctors are graduates," we know doctors are a subset of graduates. From "Some graduates are researchers," there exists an overlap between graduates and researchers. However, we cannot conclude that any doctor is a researcher, because the doctors could be entirely within the non-researcher portion of graduates. Thus, neither conclusion is guaranteed.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'All doctors are researchers.', is_correct: 0 },
      { label: 'B', option_text: 'Some doctors are researchers.', is_correct: 0 },
      { label: 'C', option_text: 'No doctor is a researcher.', is_correct: 0 },
      { label: 'D', option_text: 'Neither A, B, nor C necessarily follows.', is_correct: 1 },
    ],
  },
  {
    id: 'APT_2017_CH14_Q14',
    grade: 12,
    stream: 'shared',
    subject: 'Aptitude',
    year: 2017,
    chapter: 14,
    difficulty: 'easy',
    time_limit_sec: 60,
    question_text:
      'Find the next term in the sequence: 3, 9, 27, 81, ?',
    explanation_text:
      'Each term is multiplied by 3 to get the next term: \\( 3 \\times 3 = 9 \\), \\( 9 \\times 3 = 27 \\), \\( 27 \\times 3 = 81 \\), \\( 81 \\times 3 = 243 \\). This is a geometric sequence with common ratio \\( r = 3 \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '162', is_correct: 0 },
      { label: 'B', option_text: '243', is_correct: 1 },
      { label: 'C', option_text: '324', is_correct: 0 },
      { label: 'D', option_text: '135', is_correct: 0 },
    ],
  },
  {
    id: 'APT_2017_CH15_Q15',
    grade: 12,
    stream: 'shared',
    subject: 'Aptitude',
    year: 2017,
    chapter: 15,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'A cube is painted on all six faces and then cut into 27 smaller cubes of equal size. How many of the smaller cubes have exactly two faces painted?',
    explanation_text:
      'A \\( 3 \\times 3 \\times 3 \\) cube has 27 unit cubes. Cubes with exactly two painted faces lie on the edges, excluding the corners. Each of the 12 edges has 1 such cube (the middle one on each edge). So \\( 12 \\times 1 = 12 \\) cubes have exactly two painted faces.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '6', is_correct: 0 },
      { label: 'B', option_text: '8', is_correct: 0 },
      { label: 'C', option_text: '12', is_correct: 1 },
      { label: 'D', option_text: '27', is_correct: 0 },
    ],
  },
  {
    id: 'APT_2017_CH16_Q16',
    grade: 12,
    stream: 'shared',
    subject: 'Aptitude',
    year: 2017,
    chapter: 16,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'A class of 40 students had the following results on a mathematics exam:\n\nScore 0–40: 5 students\nScore 41–60: 10 students\nScore 61–80: 15 students\nScore 81–100: 10 students\n\nWhat percentage of students scored above 60?',
    explanation_text:
      'Students scoring above 60 are those in the 61–80 and 81–100 ranges: \\( 15 + 10 = 25 \\) students. Total students = 40. Percentage = \\( \\frac{25}{40} \\times 100\\% = 62.5\\% \\).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '37.5%', is_correct: 0 },
      { label: 'B', option_text: '50%', is_correct: 0 },
      { label: 'C', option_text: '62.5%', is_correct: 1 },
      { label: 'D', option_text: '75%', is_correct: 0 },
    ],
  },

  // ═══════════════════════════════════════════
  // BIOLOGY (4) — stream: natural
  // ═══════════════════════════════════════════
  {
    id: 'BIO_2017_CH3_Q17',
    grade: 12,
    stream: 'natural',
    subject: 'Biology',
    year: 2017,
    chapter: 3,
    difficulty: 'easy',
    time_limit_sec: 60,
    question_text:
      'The primary function of mitochondria in eukaryotic cells is:',
    explanation_text:
      'Mitochondria are double-membrane organelles known as the "powerhouses" of the cell. They carry out aerobic respiration, converting glucose and oxygen into ATP (adenosine triphosphate), which is the primary energy currency of the cell. The other options refer to functions of different organelles: protein synthesis (ribosomes), lipid synthesis (smooth endoplasmic reticulum), and waste breakdown (lysosomes).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Protein synthesis', is_correct: 0 },
      { label: 'B', option_text: 'ATP production through aerobic respiration', is_correct: 1 },
      { label: 'C', option_text: 'Lipid synthesis', is_correct: 0 },
      { label: 'D', option_text: 'Breakdown of cellular waste', is_correct: 0 },
    ],
  },
  {
    id: 'BIO_2017_CH6_Q18',
    grade: 12,
    stream: 'natural',
    subject: 'Biology',
    year: 2017,
    chapter: 6,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'In a monohybrid cross between two heterozygous tall pea plants \\( (Tt \\times Tt) \\), where tall \\( (T) \\) is dominant over short \\( (t) \\), what is the expected phenotypic ratio in the offspring?',
    explanation_text:
      'Using a Punnett square for \\( Tt \\times Tt \\):\n\\( TT \\) (tall), \\( Tt \\) (tall), \\( tT \\) (tall), \\( tt \\) (short).\nThree out of four offspring are tall, one is short. The phenotypic ratio is 3:1 (tall : short).',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '1:1', is_correct: 0 },
      { label: 'B', option_text: '1:2:1', is_correct: 0 },
      { label: 'C', option_text: '3:1', is_correct: 1 },
      { label: 'D', option_text: '9:3:3:1', is_correct: 0 },
    ],
  },
  {
    id: 'BIO_2017_CH10_Q19',
    grade: 12,
    stream: 'natural',
    subject: 'Biology',
    year: 2017,
    chapter: 10,
    difficulty: 'medium',
    time_limit_sec: 90,
    question_text:
      'In a typical food chain, approximately what percentage of energy is transferred from one trophic level to the next?',
    explanation_text:
      'The 10% rule of energy transfer states that, on average, only about 10% of the energy stored in one trophic level is passed on to the next level. The remaining 90% is lost as heat through metabolic processes, respiration, and incomplete digestion. This is why food chains rarely exceed 4-5 trophic levels.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '50%', is_correct: 0 },
      { label: 'B', option_text: '25%', is_correct: 0 },
      { label: 'C', option_text: '10%', is_correct: 1 },
      { label: 'D', option_text: '90%', is_correct: 0 },
    ],
  },
  {
    id: 'BIO_2017_CH14_Q20',
    grade: 12,
    stream: 'natural',
    subject: 'Biology',
    year: 2017,
    chapter: 14,
    difficulty: 'hard',
    time_limit_sec: 90,
    question_text:
      'The sinoatrial (SA) node, known as the natural pacemaker of the heart, is located in the:',
    explanation_text:
      'The sinoatrial node is a specialized group of cardiac muscle cells located in the wall of the right atrium, near the opening of the superior vena cava. It generates electrical impulses spontaneously, initiating each heartbeat and setting the heart rate. The impulses then spread through the atria to the atrioventricular (AV) node.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Left ventricle', is_correct: 0 },
      { label: 'B', option_text: 'Right atrium', is_correct: 1 },
      { label: 'C', option_text: 'Interventricular septum', is_correct: 0 },
      { label: 'D', option_text: 'Left atrium', is_correct: 0 },
    ],
  },

  // ═══════════════════════════════════════════
  // HISTORY (4) — stream: social
  // ═══════════════════════════════════════════
  {
    id: 'HIS_2017_CH2_Q21',
    grade: 12,
    stream: 'social',
    subject: 'History',
    year: 2017,
    chapter: 2,
    difficulty: 'medium',
    time_limit_sec: 60,
    question_text:
      'The Kingdom of Aksum reached its peak of power during the reign of which ruler?',
    explanation_text:
      'King Ezana (c. 320–360 AD) was one of the most significant Aksumite rulers. During his reign, Aksum reached its zenith in territorial expansion and economic prosperity. Ezana is also notable for converting to Christianity and making it the state religion, as evidenced by coins and inscriptions from his era.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'King Ezana', is_correct: 1 },
      { label: 'B', option_text: 'Emperor Menelik II', is_correct: 0 },
      { label: 'C', option_text: 'King Lalibela', is_correct: 0 },
      { label: 'D', option_text: 'Emperor Tewodros II', is_correct: 0 },
    ],
  },
  {
    id: 'HIS_2017_CH4_Q22',
    grade: 12,
    stream: 'social',
    subject: 'History',
    year: 2017,
    chapter: 4,
    difficulty: 'easy',
    time_limit_sec: 60,
    question_text:
      'The rock-hewn churches of Lalibela were constructed during the rule of which dynasty?',
    explanation_text:
      'The rock-hewn churches of Lalibela, a UNESCO World Heritage site, were built during the Zagwe dynasty (c. 900–1270 AD), specifically under King Lalibela. These monolithic churches, carved out of solid rock, are among the most remarkable architectural achievements of medieval Ethiopia.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'Solomonic Dynasty', is_correct: 0 },
      { label: 'B', option_text: 'Zagwe Dynasty', is_correct: 1 },
      { label: 'C', option_text: 'Aksumite Dynasty', is_correct: 0 },
      { label: 'D', option_text: 'Gondarine Dynasty', is_correct: 0 },
    ],
  },
  {
    id: 'HIS_2017_CH8_Q23',
    grade: 12,
    stream: 'social',
    subject: 'History',
    year: 2017,
    chapter: 8,
    difficulty: 'medium',
    time_limit_sec: 60,
    question_text:
      'In which year was the Battle of Adwa fought, marking Ethiopia\'s victory over Italian colonial forces?',
    explanation_text:
      'The Battle of Adwa was fought on March 1, 1896. Under Emperor Menelik II, Ethiopian forces decisively defeated the Italian army, securing Ethiopian sovereignty and making Ethiopia the only African nation to successfully resist European colonization during the Scramble for Africa.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: '1889', is_correct: 0 },
      { label: 'B', option_text: '1896', is_correct: 1 },
      { label: 'C', option_text: '1905', is_correct: 0 },
      { label: 'D', option_text: '1935', is_correct: 0 },
    ],
  },
  {
    id: 'HIS_2017_CH12_Q24',
    grade: 12,
    stream: 'social',
    subject: 'History',
    year: 2017,
    chapter: 12,
    difficulty: 'hard',
    time_limit_sec: 90,
    question_text:
      'The Industrial Revolution, which began in the late 18th century, first took hold in which country?',
    explanation_text:
      'The Industrial Revolution began in Great Britain in the late 18th century (c. 1760) before spreading to other parts of Europe and North America. Several factors contributed to Britain being first: abundant coal and iron reserves, a stable political system, colonial resources, a developed banking system, and key inventions such as the steam engine by James Watt.',
    package_id: 'seed_2017_v1',
    options: [
      { label: 'A', option_text: 'France', is_correct: 0 },
      { label: 'B', option_text: 'Germany', is_correct: 0 },
      { label: 'C', option_text: 'Great Britain', is_correct: 1 },
      { label: 'D', option_text: 'United States', is_correct: 0 },
    ],
  },
];

export async function seedDatabase(): Promise<void> {
  await executeTransaction(async (tx: Transaction) => {
    await tx.execute("DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE package_id = 'seed_2017_v1')");
    await tx.execute("DELETE FROM questions WHERE package_id = 'seed_2017_v1'");

    for (const q of SEED_QUESTIONS) {
      await tx.execute(
        `INSERT INTO questions (id, grade, stream, subject, year, chapter, difficulty, time_limit_sec, question_text, explanation_text, package_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          q.grade,
          q.stream,
          q.subject,
          q.year,
          q.chapter,
          q.difficulty,
          q.time_limit_sec,
          q.question_text,
          q.explanation_text,
          q.package_id,
        ],
      );

      for (const opt of q.options) {
        await tx.execute(
          `INSERT INTO options (question_id, label, option_text, is_correct)
           VALUES (?, ?, ?, ?)`,
          [q.id, opt.label, opt.option_text, opt.is_correct],
        );
      }
    }
  });

  console.log(`[SeedData] Inserted ${SEED_QUESTIONS.length} questions with options`);
}
