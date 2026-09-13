require('./config/env');
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const TopicNote = require('./models/TopicNote');
const Question = require('./models/Question');
const Vocabulary = require('./models/Vocabulary');
const ReadingPassage = require('./models/ReadingPassage');
const User = require('./models/User');

const englishTopics = [
  { name: 'Grammar', slug: 'grammar', difficulty: 'Medium', estimatedStudyTime: '60 mins', description: 'Core grammatical frameworks, parts of speech, syntax, and sentence mechanics.' },
  { name: 'Vocabulary', slug: 'vocabulary', difficulty: 'Medium', estimatedStudyTime: '45 mins', description: 'High-frequency GRE/CAT/Placement words, contextual definitions, and word power.' },
  { name: 'Synonyms', slug: 'synonyms', difficulty: 'Easy', estimatedStudyTime: '30 mins', description: 'Words with similar contextual denotations and nuanced shades of meaning.' },
  { name: 'Antonyms', slug: 'antonyms', difficulty: 'Easy', estimatedStudyTime: '30 mins', description: 'Exact antonyms, contrasting adjectives, and polar opposite word associations.' },
  { name: 'Idioms', slug: 'idioms', difficulty: 'Medium', estimatedStudyTime: '45 mins', description: 'Idiomatic expressions, figurative phrasing, and metaphorical corporate idioms.' },
  { name: 'One Word Substitution', slug: 'one-word-substitution', difficulty: 'Easy', estimatedStudyTime: '35 mins', description: 'Single word replacements for elaborate clauses, philosophies, and disciplines.' },
  { name: 'Reading Comprehension', slug: 'reading-comprehension', difficulty: 'Hard', estimatedStudyTime: '75 mins', description: 'Critical passage dissection, inferential reasoning, tone detection, and main idea extraction.' },
  { name: 'Sentence Correction', slug: 'sentence-correction', difficulty: 'Medium', estimatedStudyTime: '50 mins', description: 'Identifying structural redundancies, dangling modifiers, and faulty parallelism.' },
  { name: 'Error Detection', slug: 'error-detection', difficulty: 'Medium', estimatedStudyTime: '50 mins', description: 'Spotting syntactical, tense, and prepositional errors across partitioned sentences.' },
  { name: 'Active Voice & Passive Voice', slug: 'active-voice-passive-voice', difficulty: 'Easy', estimatedStudyTime: '40 mins', description: 'Transformation rules across tenses, subject-object inversion, and imperative voices.' },
  { name: 'Direct & Indirect Speech', slug: 'direct-indirect-speech', difficulty: 'Medium', estimatedStudyTime: '45 mins', description: 'Reported speech conversion, reporting verbs, backshifting tenses, and pronoun shifts.' },
  { name: 'Para Jumbles', slug: 'para-jumbles', difficulty: 'Hard', estimatedStudyTime: '60 mins', description: 'Logical sentence sequencing, opening/closing sentences, transition words, and mandatory pairs.' },
  { name: 'Tenses', slug: 'tenses', difficulty: 'Medium', estimatedStudyTime: '55 mins', description: 'Present, past, future aspects, conditional tenses, and time-frame consistency.' },
  { name: 'Articles', slug: 'articles', difficulty: 'Easy', estimatedStudyTime: '30 mins', description: 'Definite ("the") vs Indefinite ("a", "an") usage, zero article exceptions, and vowel sounds.' },
  { name: 'Prepositions', slug: 'prepositions', difficulty: 'Medium', estimatedStudyTime: '45 mins', description: 'Spatial, temporal, directional prepositions, and fixed preposition collocations.' },
  { name: 'Subject-Verb Agreement', slug: 'subject-verb-agreement', difficulty: 'Medium', estimatedStudyTime: '50 mins', description: 'Singular/plural concordance, collective nouns, compound subjects, and proximity rules.' },
  { name: 'Fill in the Blanks', slug: 'fill-in-the-blanks', difficulty: 'Easy', estimatedStudyTime: '35 mins', description: 'Single and double blank contextual completions using vocabulary and syntax clues.' },
  { name: 'Cloze Test', slug: 'cloze-test', difficulty: 'Hard', estimatedStudyTime: '60 mins', description: 'Paragraph-length fill-in exercises testing holistic comprehension and collocations.' },
  { name: 'Sentence Completion', slug: 'sentence-completion', difficulty: 'Medium', estimatedStudyTime: '40 mins', description: 'Completing partial propositions using logical conjunctions and semantic tone.' },
  { name: 'Spelling', slug: 'spelling', difficulty: 'Easy', estimatedStudyTime: '25 mins', description: 'Commonly misspelled placement words, double consonants, and silent letters.' }
];

const vocabularyData = [
  {
    word: 'ubiquitous',
    meaning: 'Present, appearing, or found everywhere simultaneously.',
    partOfSpeech: 'adjective',
    synonyms: ['omnipresent', 'pervasive', 'universal'],
    antonyms: ['rare', 'scarce', 'isolated'],
    exampleSentence: 'Smartphones have become ubiquitous in contemporary daily life.',
    usage: 'Used to describe phenomena, technology, or trends that are visible everywhere.',
    difficulty: 'Medium',
    tags: ['GRE', 'Adjectives', 'Tech']
  },
  {
    word: 'ephemeral',
    meaning: 'Lasting for a very short time; transitory.',
    partOfSpeech: 'adjective',
    synonyms: ['fleeting', 'transient', 'evanescent', 'momentary'],
    antonyms: ['permanent', 'enduring', 'perpetual', 'eternal'],
    exampleSentence: 'Fame in the digital era is often ephemeral, fading in mere weeks.',
    usage: 'Describing transient states such as trends, emotions, or physical phenomena.',
    difficulty: 'Hard',
    tags: ['GRE', 'Literature', 'Abstract']
  },
  {
    word: 'pragmatic',
    meaning: 'Dealing with things sensibly and realistically in a practical manner.',
    partOfSpeech: 'adjective',
    synonyms: ['practical', 'matter-of-fact', 'utilitarian', 'sensible'],
    antonyms: ['idealistic', 'impractical', 'quixotic'],
    exampleSentence: 'The engineering team took a pragmatic approach to meet the tight deadline.',
    usage: 'Widely used in corporate interviews to describe problem-solving philosophy.',
    difficulty: 'Medium',
    tags: ['Corporate', 'Interviews', 'Strategy']
  },
  {
    word: 'resilient',
    meaning: 'Able to withstand or recover quickly from difficult conditions.',
    partOfSpeech: 'adjective',
    synonyms: ['adaptable', 'tough', 'buoyant', 'tenacious'],
    antonyms: ['fragile', 'vulnerable', 'brittle'],
    exampleSentence: 'A resilient cloud infrastructure guarantees high uptime even during network outages.',
    usage: 'Frequently applied to distributed systems, human character, and economics.',
    difficulty: 'Easy',
    tags: ['Core', 'Personality', 'Engineering']
  },
  {
    word: 'lucid',
    meaning: 'Expressed clearly; easy to understand; rational.',
    partOfSpeech: 'adjective',
    synonyms: ['clear', 'coherent', 'articulate', 'unambiguous'],
    antonyms: ['confusing', 'vague', 'murky', 'ambiguous'],
    exampleSentence: 'She gave a lucid presentation that simplified intricate quantum mechanics.',
    usage: 'Used for communication, writing, explanations, and states of mind.',
    difficulty: 'Medium',
    tags: ['Communication', 'Writing']
  },
  {
    word: 'meticulous',
    meaning: 'Showing great attention to detail; very careful and precise.',
    partOfSpeech: 'adjective',
    synonyms: ['thorough', 'scrupulous', 'punctilious', 'diligent'],
    antonyms: ['careless', 'sloppy', 'negligent'],
    exampleSentence: 'The code underwent meticulous unit and integration testing before production deployment.',
    usage: 'Describing disciplined work ethics, auditing, and precision engineering.',
    difficulty: 'Medium',
    tags: ['Interview', 'Qualities']
  },
  {
    word: 'alleviate',
    meaning: 'Make suffering, deficiency, or a problem less severe.',
    partOfSpeech: 'verb',
    synonyms: ['mitigate', 'relieve', 'ease', 'palliate'],
    antonyms: ['aggravate', 'exacerbate', 'worsen'],
    exampleSentence: 'Implementing caching algorithms will alleviate database load during peak traffic.',
    usage: 'Describing solution-oriented actions tackling performance or systemic issues.',
    difficulty: 'Medium',
    tags: ['Verbs', 'Problem Solving']
  },
  {
    word: 'candid',
    meaning: 'Truthful and straightforward; frank.',
    partOfSpeech: 'adjective',
    synonyms: ['frank', 'outspoken', 'honest', 'forthright'],
    antonyms: ['guarded', 'insincere', 'evasive'],
    exampleSentence: 'During the exit interview, the developer shared candid feedback about the workflow.',
    usage: 'Characterizing honest discourse and transparent team communication.',
    difficulty: 'Easy',
    tags: ['HR', 'Interviews']
  }
];

const readingPassages = [
  {
    title: 'The Paradigm Shift to Edge Computing',
    topic: 'Reading Comprehension',
    difficulty: 'Medium',
    passageText: `Cloud computing has revolutionized digital enterprise architecture over the past two decades by centralizing compute, storage, and analytics in massive hyperscale data centers. However, as billions of Internet of Things (IoT) devices, autonomous vehicles, and real-time medical sensors proliferate, the latency penalty of routing gigabytes of telemetry data across transnational backbones has become untenable.

Enter Edge Computing: a distributed computing paradigm that brings computation and data storage closer to the location where it is needed, directly on local gateways, base stations, and localized micro-data centers. By processing data at the edge of the network, organizations drastically reduce round-trip latency, optimize bandwidth consumption, and bolster data privacy compliance by minimizing off-site transmission.

Nevertheless, edge computing introduces distinct engineering trade-offs. Decentralized environments exacerbate physical and cybersecurity threat surfaces, demand autonomous orchestration without human intervention, and operate under stringent power constraints. As 5G adoption accelerates, hybrid architectures harmonizing centralized cloud intelligence with localized edge responsiveness represent the foreseeable frontier of software scalability.`,
    questions: [
      {
        questionText: 'What is the primary catalyst compelling the adoption of edge computing over pure cloud architectures?',
        options: [
          'The reduction of data center operational costs',
          'Latency penalties and massive bandwidth demands from billions of IoT devices',
          'The complete obsolescence of centralized hyperscale data centers',
          'Mandatory global compliance laws outlawing cloud storage'
        ],
        correctAnswer: 'Latency penalties and massive bandwidth demands from billions of IoT devices',
        explanation: 'Paragraph 1 explicitly notes that as IoT and autonomous devices proliferate, the latency penalty and bandwidth strain of routing telemetry across transnational backbones make pure centralization untenable.',
        marks: 1
      },
      {
        questionText: 'According to the passage, which of the following is a prominent engineering challenge of edge computing?',
        options: [
          'Inability to process sensor telemetry locally',
          'Extreme physical and cybersecurity threat surfaces across decentralized nodes',
          'Absence of 5G telecommunication standards',
          'Excessive reliance on manual human intervention at every local node'
        ],
        correctAnswer: 'Extreme physical and cybersecurity threat surfaces across decentralized nodes',
        explanation: 'Paragraph 3 highlights that decentralized nodes exacerbate physical/cybersecurity attack surfaces and operate under strict power/autonomy constraints.',
        marks: 1
      },
      {
        questionText: 'What is the overarching conclusion drawn by the author regarding future digital infrastructure?',
        options: [
          'Edge computing will completely eradicate centralized cloud providers.',
          'Hybrid architectures balancing centralized cloud intelligence with edge responsiveness will prevail.',
          '5G networks will render both cloud and edge computing obsolete.',
          'Data privacy concerns will prevent enterprise adoption of edge computing.'
        ],
        correctAnswer: 'Hybrid architectures balancing centralized cloud intelligence with edge responsiveness will prevail.',
        explanation: 'The final sentence states that hybrid architectures harmonizing cloud intelligence with edge responsiveness represent the frontier of scalability.',
        marks: 1
      }
    ]
  },
  {
    title: 'The Psychology of Cognitive Biases in Decision Making',
    topic: 'Reading Comprehension',
    difficulty: 'Hard',
    passageText: `Human rationality is fundamentally bounded. Herbert Simon introduced the concept of "bounded rationality" to articulate how cognitive limitations, imperfect information, and finite time force decision-makers to satisfice rather than optimize. Over subsequent decades, behavioral economists Daniel Kahneman and Amos Tversky cataloged numerous systematic deviations from normative logic, termed cognitive biases.

Among these, the "confirmation bias" leads individuals to actively search for, interpret, and recall information in a way that confirms preexisting hypotheses while disregarding contradictory empirical evidence. In engineering, this manifests when developers overlook warning telemetry that challenges their architectural assumptions. Similarly, the "sunk cost fallacy" compels managers to persist in allocating resources to failing software projects simply because substantial time and capital have already been invested.

Mitigating these heuristics requires institutional mechanisms rather than mere self-discipline. Techniques such as structured post-mortems, adversarial peer reviews ("red teaming"), and blind evaluations systematically dismantle biased rationalizations, fostering empirical clarity in complex systems.`,
    questions: [
      {
        questionText: 'What does Herbert Simon\'s term "satisfice" imply in the context of bounded rationality?',
        options: [
          'Computing all possible permutation outcomes before acting',
          'Selecting a satisfactory and sufficient solution rather than seeking a mathematically optimal one',
          'Completely abandoning rational decision-making for emotional impulses',
          'Optimizing outcomes without any regard for cognitive limits'
        ],
        correctAnswer: 'Selecting a satisfactory and sufficient solution rather than seeking a mathematically optimal one',
        explanation: 'Satisficing is settling on an adequate, workable solution within constraints rather than calculating the exhaustive optimal outcome.',
        marks: 1
      },
      {
        questionText: 'How does the passage suggest organizations should counteract cognitive biases?',
        options: [
          'By demanding developers rely purely on self-discipline',
          'By implementing structured institutional processes like red teaming and blind reviews',
          'By eliminating human oversight entirely in favor of unfiltered algorithms',
          'By funding projects indefinitely to bypass the sunk cost fallacy'
        ],
        correctAnswer: 'By implementing structured institutional processes like red teaming and blind reviews',
        explanation: 'The final paragraph states that mitigation requires institutional mechanisms like structured post-mortems, red teaming, and blind reviews.',
        marks: 1
      }
    ]
  }
];

const sampleQuestions = [
  // 1. Subject-Verb Agreement
  {
    moduleType: 'English',
    category: 'Subject-Verb Agreement',
    topic: 'Subject-Verb Agreement',
    questionType: 'mcq',
    difficulty: 'Medium',
    questionText: 'Neither the team manager nor the software developers _____ able to reproduce the concurrency bug during yesterday\'s stress test.',
    options: ['was', 'were', 'is', 'are'],
    correctAnswer: 'were',
    explanation: 'When subjects are joined by "neither... nor", the verb agrees with the closer subject ("software developers" is plural, requiring the past plural verb "were").',
    rule: 'Rule of Proximity with correlative conjunctions (neither... nor, either... or).',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 2. Error Detection
  {
    moduleType: 'English',
    category: 'Error Detection',
    topic: 'Error Detection',
    questionType: 'error_detection',
    difficulty: 'Medium',
    questionText: 'Identify the segment that contains a grammatical error:\n\n[A] One of the most senior engineers / [B] have decided to decline / [C] the promotion offered by / [D] the multinational corporation.',
    options: [
      '[A] One of the most senior engineers',
      '[B] have decided to decline',
      '[C] the promotion offered by',
      '[D] the multinational corporation'
    ],
    correctAnswer: '[B] have decided to decline',
    explanation: 'The subject is "One" (singular), not "engineers". Therefore, the singular auxiliary verb "has decided" must be used instead of "have decided".',
    rule: '"One of the + Plural Noun" always takes a singular verb.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 3. Para Jumbles
  {
    moduleType: 'English',
    category: 'Para Jumbles',
    topic: 'Para Jumbles',
    questionType: 'para_jumble',
    difficulty: 'Hard',
    questionText: 'Arrange the following sentences in a coherent, logical sequence:\n\nA. However, unmonitored microservices can rapidly escalate system complexity.\nB. Modern software organizations are increasingly transitioning to distributed architectures.\nC. This shift is primarily driven by the need for independent deployment and resilience.\nD. Therefore, robust observability and automated tracing tools are essential.',
    options: [
      'B - C - A - D',
      'B - A - C - D',
      'C - B - D - A',
      'A - B - C - D'
    ],
    correctAnswer: 'B - C - A - D',
    explanation: 'B establishes the overarching topic (transition to distributed architectures). C explains "This shift". A introduces the contrasting challenge with "However". D concludes logically with "Therefore". Sequence: B-C-A-D.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 4. Prepositions
  {
    moduleType: 'English',
    category: 'Prepositions',
    topic: 'Prepositions',
    questionType: 'mcq',
    difficulty: 'Easy',
    questionText: 'The lead architect is thoroughly adept _____ designing fault-tolerant distributed event streams.',
    options: ['at', 'in', 'with', 'on'],
    correctAnswer: 'at',
    explanation: 'The adjective "adept" is idiomatic and collocated with the preposition "at" (or "in") when denoting proficiency in a skill ("adept at designing").',
    rule: 'Fixed preposition collocation: Adept at + Verb-ing.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 5. Active & Passive Voice
  {
    moduleType: 'English',
    category: 'Active Voice & Passive Voice',
    topic: 'Active Voice & Passive Voice',
    questionType: 'mcq',
    difficulty: 'Easy',
    questionText: 'Convert the following active sentence into passive voice:\n\n"The security audit team detected multiple critical zero-day vulnerabilities."',
    options: [
      'Multiple critical zero-day vulnerabilities were detected by the security audit team.',
      'Multiple critical zero-day vulnerabilities had been detected by the security audit team.',
      'Multiple critical zero-day vulnerabilities are detected by the security audit team.',
      'Multiple critical zero-day vulnerabilities have been detected by the security audit team.'
    ],
    correctAnswer: 'Multiple critical zero-day vulnerabilities were detected by the security audit team.',
    explanation: 'Simple Past Active ("detected") converts into Simple Past Passive ("were detected" for plural subject).',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 6. Direct & Indirect Speech
  {
    moduleType: 'English',
    category: 'Direct & Indirect Speech',
    topic: 'Direct & Indirect Speech',
    questionType: 'mcq',
    difficulty: 'Medium',
    questionText: 'Convert into indirect speech:\n\nThe team lead said, "We must deploy the hotfix before midnight."',
    options: [
      'The team lead said that they had to deploy the hotfix before midnight.',
      'The team lead says that we must deploy the hotfix before midnight.',
      'The team lead said that they will deploy the hotfix before midnight.',
      'The team lead asked if they can deploy the hotfix before midnight.'
    ],
    correctAnswer: 'The team lead said that they had to deploy the hotfix before midnight.',
    explanation: 'When converting into reported speech with a past reporting verb ("said"), "we" shifts to "they" and obligation modal "must" backshifts to "had to".',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 7. Idioms
  {
    moduleType: 'English',
    category: 'Idioms',
    topic: 'Idioms',
    questionType: 'mcq',
    difficulty: 'Easy',
    questionText: 'What is the meaning of the idiom "to burn the candle at both ends"?',
    options: [
      'To exhaust one\'s energy or resources by working excessively long hours',
      'To waste valuable candle wax during power cuts',
      'To invest in dual cryptocurrency portfolios',
      'To compromise the security of both frontend and backend systems'
    ],
    correctAnswer: 'To exhaust one\'s energy or resources by working excessively long hours',
    explanation: '"Burning the candle at both ends" signifies overworking oneself from early morning until late at night without sufficient rest.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 8. Tenses
  {
    moduleType: 'English',
    category: 'Tenses',
    topic: 'Tenses',
    questionType: 'mcq',
    difficulty: 'Medium',
    questionText: 'By the time the new feature launches next month, the quality assurance team _____ comprehensive automated regressions for over three weeks.',
    options: [
      'will have been running',
      'has been running',
      'had run',
      'is running'
    ],
    correctAnswer: 'will have been running',
    explanation: 'Future Perfect Continuous ("will have been running") is required for an ongoing action that will continue up to a designated future milestone ("By the time... launches next month").',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 9. Vocabulary / Synonyms
  {
    moduleType: 'English',
    category: 'Synonyms',
    topic: 'Synonyms',
    questionType: 'mcq',
    difficulty: 'Medium',
    questionText: 'Select the word most similar in meaning to "CANDID":',
    options: ['Frank', 'Deceptive', 'Timid', 'Evasive'],
    correctAnswer: 'Frank',
    explanation: '"Candid" means truthful, straightforward, and sincere; "Frank" is its direct synonym.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 10. Antonyms
  {
    moduleType: 'English',
    category: 'Antonyms',
    topic: 'Antonyms',
    questionType: 'mcq',
    difficulty: 'Medium',
    questionText: 'Select the exact antonym of "EPHEMERAL":',
    options: ['Permanent', 'Transient', 'Fleeting', 'Brief'],
    correctAnswer: 'Permanent',
    explanation: '"Ephemeral" means short-lived or transitory. Its exact polar opposite is "Permanent".',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 11. Articles
  {
    moduleType: 'English',
    category: 'Articles',
    topic: 'Articles',
    questionType: 'mcq',
    difficulty: 'Easy',
    questionText: 'Choose the appropriate article:\n\n"He is _____ honorable alumnus of the university who established an open-source research fund."',
    options: ['an', 'a', 'the', 'No article needed'],
    correctAnswer: 'an',
    explanation: 'Although "honorable" begins with consonant \'h\', the initial sound is a vowel sound (/ˈɒn.ər.ə.bəl/). Hence, the indefinite article "an" is used.',
    rule: 'Articles are governed by phonetic sounds, not spelling letters.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 12. One Word Substitution
  {
    moduleType: 'English',
    category: 'One Word Substitution',
    topic: 'One Word Substitution',
    questionType: 'mcq',
    difficulty: 'Easy',
    questionText: 'What is the one-word substitution for "A person who loves books and collects them passionately"?',
    options: ['Bibliophile', 'Philatelist', 'Polyglot', 'Misanthrope'],
    correctAnswer: 'Bibliophile',
    explanation: 'From Greek root "biblio" (book) + "phile" (lover). A bibliophile is a passionate collector and lover of books.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 13. Spelling
  {
    moduleType: 'English',
    category: 'Spelling',
    topic: 'Spelling',
    questionType: 'mcq',
    difficulty: 'Easy',
    questionText: 'Select the correctly spelled word:',
    options: ['Accommodate', 'Acommodate', 'Accomodate', 'Acomodate'],
    correctAnswer: 'Accommodate',
    explanation: 'The correct spelling is "Accommodate" with double \'c\' and double \'m\'.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 14. Cloze Test
  {
    moduleType: 'English',
    category: 'Cloze Test',
    topic: 'Cloze Test',
    questionType: 'mcq',
    difficulty: 'Hard',
    questionText: 'Select the most contextually fitting word for blank (1):\n\n"Artificial Intelligence has transformed the IT landscape, making continuous learning an absolute (1) _____ rather than a luxury."',
    options: ['necessity', 'hindrance', 'option', 'coincidence'],
    correctAnswer: 'necessity',
    explanation: 'The contrast word "rather than a luxury" makes "necessity" the exact antonymic pair to complete the thought.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  },
  // 15. Sentence Correction
  {
    moduleType: 'English',
    category: 'Sentence Correction',
    topic: 'Sentence Correction',
    questionType: 'sentence_correction',
    difficulty: 'Medium',
    questionText: 'Choose the correct version of the underlined phrase:\n\n"Having finished the code refactor, the test suite passed flawlessly."',
    options: [
      'After the developer finished the code refactor, the test suite passed flawlessly.',
      'Having finished the code refactor, the test suite was passed flawlessly.',
      'Having finished the code refactor, flawlessly the test suite passed.',
      'The test suite passed flawlessly having finished the code refactor.'
    ],
    correctAnswer: 'After the developer finished the code refactor, the test suite passed flawlessly.',
    explanation: 'The original sentence contains a dangling modifier ("the test suite" did not finish the refactor, the developer did). Option A fixes the agent reference.',
    marks: 1,
    negativeMarks: 0.25,
    status: 'published'
  }
];

async function seedEnglishModule() {
  console.log('=== SEEDING ENGLISH PREP MODULE IN MONGODB ===');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);

  const admin = await User.findOne({ role: 'admin' });
  const adminId = admin ? admin._id : null;

  // 1. Seed Topics
  console.log('1. Seeding 20 English Topics...');
  for (let i = 0; i < englishTopics.length; i++) {
    const t = englishTopics[i];
    await Topic.findOneAndUpdate(
      { moduleType: 'English', slug: t.slug },
      {
        moduleType: 'English',
        name: t.name,
        slug: t.slug,
        description: t.description,
        difficulty: t.difficulty,
        estimatedStudyTime: t.estimatedStudyTime,
        status: 'active',
        displayOrder: i + 1,
        createdBy: adminId
      },
      { upsert: true, new: true }
    );
  }

  // 2. Seed Study Guides for all 20 Topics
  console.log('2. Seeding Complete English Study Guides & Notes...');
  for (const t of englishTopics) {
    await TopicNote.findOneAndUpdate(
      { moduleType: 'English', topic: t.name },
      {
        moduleType: 'English',
        topic: t.name,
        title: `${t.name} Master Guide & Placement Rules`,
        slug: t.slug,
        introduction: `Comprehensive preparation guide for ${t.name}. Master core concepts, grammar structures, exam shortcuts, and solved placement examples.`,
        concepts: [
          {
            title: `Core Principles of ${t.name}`,
            content: `Understanding ${t.name} requires establishing sound foundational mechanics. Key placement tests evaluate precision, syntax awareness, contextual vocabulary, and error elimination under timed constraints.`
          },
          {
            title: `Placement Patterns & Corporate Testing Styles`,
            content: `Leading recruiters (TCS, Infosys, Wipro, Accenture, Cognizant, Amazon) structure verbal ability questions around standard rule applications, edge-case exceptions, and reading agility.`
          }
        ],
        rules: [
          `Rule 1: Always identify the main clause subject before matching verbal concordance.`,
          `Rule 2: Check for prepositional and idiomatic collocations rather than literal word-to-word translation.`,
          `Rule 3: Eliminate extreme answer choices (all, never, exclusively) in inference and reading comprehension questions.`,
          `Rule 4: In parallel constructions, ensure all connected elements share the exact grammatical form (e.g. gerund to gerund, infinitive to infinitive).`
        ],
        shortcuts: [
          {
            name: 'Subject Isolation Technique',
            tip: 'Place parentheses around prepositional phrases between subject and verb to avoid distraction.',
            example: 'The box (of chocolates) [is] on the table.'
          },
          {
            name: 'Tone Polarity Detection',
            tip: 'Scan for qualifying transition adverbs (however, nonetheless, moreover, hence) to predict sentence polarity.',
            example: 'She studied diligently; [however], the exam was unprecedentedly challenging.'
          },
          {
            name: 'Concordance Elimination',
            tip: 'Discard choices containing blatant subject-verb mismatch before analyzing vocabulary depth.',
            example: 'Neither of the options [was] suitable.'
          }
        ],
        solvedExamples: [
          {
            question: `Identify the correct sentence:\n(A) The committee has submitted their report.\n(B) The committee has submitted its report.`,
            solution: `Option (B) is correct. When a collective noun acts as a unified singular body, it takes a singular pronoun ("its") and singular verb ("has").`
          },
          {
            question: `Choose the correct option: She is senior _____ me in this development organization.`,
            solution: `Answer: "to". Latin comparative adjectives ending in -ior (senior, junior, prior, superior, inferior) are followed by preposition "to", never "than".`
          }
        ],
        commonMistakes: [
          `Using "than" after comparative adjectives like senior, junior, or prefer.`,
          `Confusing collective nouns acting as singular units with collective nouns acting as separated individuals.`,
          `Treating compound nouns joined by "as well as", "together with", or "along with" as plural compound subjects.`
        ],
        placementTips: [
          `Read the full sentence once to capture holistic context before looking at the options.`,
          `In corporate verbal tests, accuracy matters more than rapid guesswork due to negative marking penalties.`
        ],
        status: 'published',
        createdBy: adminId
      },
      { upsert: true, new: true }
    );
  }

  // 3. Seed Vocabulary
  console.log('3. Seeding Vocabulary Bank...');
  for (const v of vocabularyData) {
    await Vocabulary.findOneAndUpdate(
      { word: v.word },
      { ...v, createdBy: adminId, status: 'published' },
      { upsert: true, new: true }
    );
  }

  // 4. Seed Reading Passages
  console.log('4. Seeding Reading Comprehension Passages...');
  for (const p of readingPassages) {
    await ReadingPassage.findOneAndUpdate(
      { title: p.title },
      { ...p, createdBy: adminId, status: 'published' },
      { upsert: true, new: true }
    );
  }

  // 5. Seed Questions Bank
  console.log('5. Seeding English Questions Bank...');
  for (const q of sampleQuestions) {
    await Question.findOneAndUpdate(
      { questionText: q.questionText, moduleType: 'English' },
      { ...q, createdBy: adminId },
      { upsert: true, new: true }
    );
  }

  console.log('=== ENGLISH PREP MODULE SEEDING COMPLETED SUCCESSFULLY ===');
  await mongoose.connection.close();
}

seedEnglishModule().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
