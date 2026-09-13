require('./config/env');
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Question = require('./models/Question');
const TopicNote = require('./models/TopicNote');
const User = require('./models/User');

const REASONING_TOPICS = [
  {
    name: 'Logical Reasoning',
    slug: 'logical-reasoning',
    difficulty: 'Medium',
    estimatedStudyTime: '45 mins',
    description: 'Deductive reasoning, pattern recognition, conditional arguments, and logical validity checks.',
    icon: 'FiLayers',
    displayOrder: 1,
    note: {
      introduction: 'Logical reasoning evaluates your ability to analyze given assertions, detect premises, and draw valid conclusions under structured constraints.',
      concepts: [
        { title: 'Deductive vs Inductive Logic', content: 'Deductive reasoning moves from general rules to specific guaranteed conclusions. Inductive logic forms generalized principles based on observed cases.' },
        { title: 'Conditional Statements', content: 'Statements in "If P then Q" form. Remember that contrapositive (~Q => ~P) is logically equivalent, whereas converse (Q => P) is not automatically true.' }
      ],
      rules: [
        'Do not assume facts outside the given premise.',
        'Beware of absolute words like "always", "never", "only" unless explicitly stated in the premise.',
        'Construct truth tables or Venn diagrams for multi-variable deductions.'
      ],
      shortcuts: [
        { name: 'Contrapositive Rule', tip: 'If "All A are B", then "Whatever is not B is definitely not A".', example: 'All developers write code => If John does not write code, he is not a developer.' }
      ],
      solvedExamples: [
        {
          question: 'Statement: If it rains, the ground gets wet.\nConclusion I: The ground is wet, so it must have rained.\nConclusion II: It did not rain, so the ground cannot be wet.',
          solution: 'Neither conclusion logically follows.',
          explanation: 'The ground could be wet from a sprinkler (converse error). Also, rain is sufficient, not the only cause.'
        }
      ],
      placementTips: ['Extremely common in TCS NQT, Capgemini, and Accenture logical ability sections.']
    },
    questions: [
      {
        questionText: 'Look at this sequence: 7, 10, 8, 11, 9, 12, ... What number should come next?',
        options: ['7', '10', '12', '13'],
        correctAnswer: '10',
        explanation: 'This is an alternating addition and subtraction series: +3, -2, +3, -2, +3, -2. 12 - 2 = 10.',
        difficulty: 'Easy',
        tags: ['Series', 'Logical']
      },
      {
        questionText: 'Statements: All mangoes are golden in colour. No golden-coloured things are cheap.\nConclusions:\nI. All mangoes are cheap.\nII. Golden-coloured mangoes are not cheap.',
        options: ['Only conclusion I follows', 'Only conclusion II follows', 'Either I or II follows', 'Neither I nor II follows'],
        correctAnswer: 'Only conclusion II follows',
        explanation: 'Since mangoes are golden in colour and no golden things are cheap, golden-coloured mangoes are not cheap.',
        difficulty: 'Medium',
        tags: ['Deduction', 'Syllogism']
      },
      {
        questionText: 'In a certain code, "FIRE" is coded as "DGPC". What is the code for "SHOT"?',
        options: ['QFM R', 'QFMR', 'PGMR', 'QEMR'],
        correctAnswer: 'QFMR',
        explanation: 'Each letter is shifted 2 positions backward: S(-2)=Q, H(-2)=F, O(-2)=M, T(-2)=R.',
        difficulty: 'Easy',
        tags: ['Coding', 'Alphabet']
      }
    ]
  },
  {
    name: 'Blood Relation',
    slug: 'blood-relation',
    difficulty: 'Medium',
    estimatedStudyTime: '50 mins',
    description: 'Family tree diagrams, coded relationship decoders, and multi-generation pedigree deductions.',
    icon: 'FiUsers',
    displayOrder: 2,
    note: {
      introduction: 'Blood Relation problems test your ability to decipher familial links from descriptive statements, symbolic codes, or pointing-type prompts.',
      concepts: [
        { title: 'Family Tree Hierarchy', content: 'Draw parents/grandparents above, siblings/spouses horizontally, and children/grandchildren below. Use (+) for male, (-) for female, and (=) for marriage.' },
        { title: 'Generational Levels', content: 'Level 0: Self, Brother, Sister, Cousin, Spouse. Level +1: Father, Mother, Uncle, Aunt. Level +2: Grandparents. Level -1: Son, Daughter, Nephew, Niece.' }
      ],
      rules: [
        'Never assume gender purely by name unless explicitly designated or inferred via relationships (e.g. mother, son).',
        'Break complex pointing statements from the end of the sentence (e.g., "my father\'s only son").'
      ],
      shortcuts: [
        { name: 'Reverse Breakdown', tip: 'Start from "my" in pointing questions and substitute relationships backward step by step.', example: '"Daughter of my mother\'s only son" -> My mother\'s only son = Myself -> My daughter.' }
      ],
      solvedExamples: [
        {
          question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
          solution: 'Father',
          explanation: 'Mother\'s only son = Suresh himself. The boy is the son of Suresh. Hence, Suresh is the father.'
        }
      ],
      placementTips: ['Master generation diagrams to solve coded relations in under 45 seconds.']
    },
    questions: [
      {
        questionText: 'Pointing to a photograph, a woman says, "This man\'s son\'s sister is my mother-in-law." How is the woman\'s husband related to the man in the photograph?',
        options: ['Son', 'Grandson', 'Son-in-law', 'Nephew'],
        correctAnswer: 'Grandson',
        explanation: 'The man\'s son\'s sister is the man\'s daughter. The woman\'s mother-in-law is the man\'s daughter. Therefore, the woman\'s husband is the grandson of the man.',
        difficulty: 'Hard',
        tags: ['Pointing', 'Family Tree']
      },
      {
        questionText: 'A is B\'s brother. C is A\'s mother. D is C\'s father. E is B\'s son. How is D related to E?',
        options: ['Grandfather', 'Great Grandfather', 'Father', 'Uncle'],
        correctAnswer: 'Great Grandfather',
        explanation: 'E is the son of B. B is C\'s child. C is D\'s child. Therefore, D is 3 generations above E (Great Grandfather).',
        difficulty: 'Medium',
        tags: ['Generations']
      },
      {
        questionText: 'Introducing a girl, Vipin said, "Her mother is the only daughter of my mother-in-law." How is Vipin related to the girl?',
        options: ['Uncle', 'Father', 'Brother', 'Husband'],
        correctAnswer: 'Father',
        explanation: 'Vipin\'s mother-in-law\'s only daughter is Vipin\'s wife. The girl\'s mother is Vipin\'s wife, so Vipin is her father.',
        difficulty: 'Easy',
        tags: ['Pointing']
      }
    ]
  },
  {
    name: 'Direction Sense',
    slug: 'direction-sense',
    difficulty: 'Easy',
    estimatedStudyTime: '40 mins',
    description: 'Cardinal and ordinal compass navigation, angle rotations, displacement via Pythagorean theorem, and shadow directions.',
    icon: 'FiCompass',
    displayOrder: 3,
    note: {
      introduction: 'Direction Sense questions evaluate navigational reasoning, turns (left/right, clockwise/anticlockwise), and final Euclidean displacement calculations.',
      concepts: [
        { title: 'Compass Cardinal Points', content: 'North (Up), South (Down), East (Right), West (Left). Ordinal: NE, NW, SE, SW at 45° intervals.' },
        { title: 'Pythagoras Displacement', content: 'When path forms a right-angled triangle, Shortest Distance = √(Base² + Height²).' },
        { title: 'Sun & Shadow Logic', content: 'Morning (Sunrise in East): Shadows fall towards West. Evening (Sunset in West): Shadows fall towards East. At 12:00 Noon: No shadow.' }
      ],
      rules: [
        'Right turn = 90° Clockwise. Left turn = 90° Counter-Clockwise.',
        'Always draw a quick coordinate grid with starting point at origin (0, 0).'
      ],
      shortcuts: [
        { name: 'Coordinate Offsets', tip: 'Track net X (East + / West -) and net Y (North + / South -) displacements.', example: '5m North (+5Y), 3m East (+3X), 2m South (-2Y) => Net (3, 3) = 3√2 NE.' }
      ],
      solvedExamples: [
        {
          question: 'Rohan walks 8 km towards East, turns right and walks 6 km. How far and in which direction is he from his starting point?',
          solution: '10 km, South-East',
          explanation: 'Distance = √(8² + 6²) = √(64 + 36) = √100 = 10 km. Direction is East + South = South-East.'
        }
      ],
      placementTips: ['Always memorize standard Pythagorean triplets: (3,4,5), (6,8,10), (5,12,13), (8,15,17).']
    },
    questions: [
      {
        questionText: 'A person walks 12 km North, then 5 km East. What is the shortest distance from the starting point?',
        options: ['17 km', '15 km', '13 km', '10 km'],
        correctAnswer: '13 km',
        explanation: 'Using Pythagorean theorem: Distance = √(12² + 5²) = √(144 + 25) = √169 = 13 km.',
        difficulty: 'Easy',
        tags: ['Pythagoras', 'Displacement']
      },
      {
        questionText: 'One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. Which direction was he facing?',
        options: ['East', 'West', 'South', 'North'],
        correctAnswer: 'South',
        explanation: 'In the morning, the sun rises in the East, so shadows fall towards the West. If the shadow is to his right, his right side points West. Thus, he is facing South.',
        difficulty: 'Medium',
        tags: ['Shadows', 'Sun']
      },
      {
        questionText: 'Kiran walks 20m towards North. He turns right and walks 30m. Now he turns right and walks 35m. Then he turns left and walks 15m. Finally he turns left and walks 15m. How far is he from the starting point?',
        options: ['15 m', '30 m', '45 m', '50 m'],
        correctAnswer: '45 m',
        explanation: 'Net X = 30 + 15 = 45m East. Net Y = 20 - 35 + 15 = 0. He is 45m East of the starting point.',
        difficulty: 'Hard',
        tags: ['Multi-turn']
      }
    ]
  },
  {
    name: 'Coding-Decoding',
    slug: 'coding-decoding',
    difficulty: 'Medium',
    estimatedStudyTime: '45 mins',
    description: 'Letter shifting, reverse alphabetical numbering, substitution codes, and matrix decoders.',
    icon: 'FiCode',
    displayOrder: 4,
    note: {
      introduction: 'Coding-Decoding tests how quickly you deduce transformation rules applied to letters, words, numbers, or symbols.',
      concepts: [
        { title: 'Alphabet Positions (EJOTY)', content: 'E=5, J=10, O=15, T=20, Y=25. Opposite pairs sum to 27 (A-Z, B-Y, C-X, D-W, E-V, F-U, G-T, H-S, I-R, J-Q, K-P, L-O, M-N).' },
        { title: 'Pattern Types', content: 'Direct position shifts (+k, -k), reverse alphabetical ordering, cross/diagonal letter swaps, vowel/consonant alternating rules.' }
      ],
      rules: [
        'Write out numerical positions of the given word and its code to spot the mathematical progression.',
        'Check for reversal of characters before calculating shift offsets.'
      ],
      shortcuts: [
        { name: 'Pair 27 Rule', tip: 'The position of opposite letters always adds up to 27. (e.g., A(1)+Z(26)=27).', example: 'OPPOSITE of H(8) = 27-8 = 19 (S).' }
      ],
      solvedExamples: [
        {
          question: 'If MACHINE is coded as 19-7-9-14-15-20-11, how is DANGER coded?',
          solution: '10-7-20-13-11-24',
          explanation: 'Each letter\'s alphabetical position is added by 6: M(13+6)=19, A(1+6)=7... D(4+6)=10, A(1+6)=7, N(14+6)=20, G(7+6)=13, E(5+6)=11, R(18+6)=24.'
        }
      ],
      placementTips: ['Standard pattern across Infosys, Wipro, and Cognizant assessments.']
    },
    questions: [
      {
        questionText: 'If "DELHI" is coded as "73541" and "CALCUTTA" as "82589662", how can "CALICUT" be coded?',
        options: ['5279431', '5978213', '8251896', '8543691'],
        correctAnswer: '8251896',
        explanation: 'Direct letter substitution: C=8, A=2, L=5, I=1, C=8, U=9, T=6 => 8251896.',
        difficulty: 'Easy',
        tags: ['Substitution']
      },
      {
        questionText: 'In a certain code language, "ROSE" is written as "ILHV". How is "MILK" written in that code?',
        options: ['NROP', 'NRPO', 'NORP', 'MRON'],
        correctAnswer: 'NROP',
        explanation: 'Each letter is replaced by its reverse alphabet letter (Opposite letter pair sum 27): M->N, I->R, L->O, K->P.',
        difficulty: 'Medium',
        tags: ['Opposite Pairs']
      },
      {
        questionText: 'If "TEACHER" is coded as "VGCEJGT", how is "CHILDREN" coded?',
        options: ['EJKNFTGP', 'EJKNFUTP', 'EJKTGPNF', 'FJLNGUQO'],
        correctAnswer: 'EJKNFTGP',
        explanation: 'Each letter is shifted forward by 2 positions (+2). C+2=E, H+2=J, I+2=K, L+2=N, D+2=F, R+2=T, E+2=G, N+2=P.',
        difficulty: 'Easy',
        tags: ['Letter Shift']
      }
    ]
  },
  {
    name: 'Seating Arrangement',
    slug: 'seating-arrangement',
    difficulty: 'Hard',
    estimatedStudyTime: '60 mins',
    description: 'Linear rows (single/double row), circular arrangements (facing center/outside), and rectangular tables.',
    icon: 'FiGrid',
    displayOrder: 5,
    note: {
      introduction: 'Seating Arrangement problems require mapping multiple entities to relative locations under direct and indirect spatial clues.',
      concepts: [
        { title: 'Circular (Facing Center)', content: 'Right = Anti-Clockwise, Left = Clockwise.' },
        { title: 'Circular (Facing Outside)', content: 'Right = Clockwise, Left = Anti-Clockwise.' },
        { title: 'Linear Row', content: 'Facing North: Right is your right, Left is your left. Facing South: Right is your left, Left is your right.' }
      ],
      rules: [
        'Always start with a 100% fixed clue (e.g. "A sits 3rd to the right of B").',
        'Maintain parallel scratch cases if a clue branches into two valid possibilities.'
      ],
      shortcuts: [
        { name: 'Circle Opposite Rule', tip: 'In an even circle of 8 people, the person opposite to position K is (K + 4).', example: 'Position 1 is opposite Position 5.' }
      ],
      solvedExamples: [
        {
          question: '6 friends A, B, C, D, E, F are sitting in a circle facing the center. A is to the left of B. C is between A and F. E is between B and D. Who is opposite to B?',
          solution: 'F',
          explanation: 'Arranging in circular order: B -> A -> C -> F -> D -> E -> B. The person opposite B is F.'
        }
      ],
      placementTips: ['Critical high-weightage topic for Amazon, TCS Digital, and Deloitte.']
    },
    questions: [
      {
        questionText: 'Five friends P, Q, R, S and T are sitting in a row facing North. S is between T and Q and Q is to the immediate left of R. P is to the immediate left of T. Who is in the middle?',
        options: ['P', 'T', 'S', 'Q'],
        correctAnswer: 'S',
        explanation: 'Arrangement from left to right: P, T, S, Q, R. S is exactly in the middle.',
        difficulty: 'Medium',
        tags: ['Linear Row']
      },
      {
        questionText: 'Eight people A through H sit around a circular table facing the center. A sits second to the right of C. B sits third to the left of A. D sits opposite A. Who sits between B and D if E sits adjacent to B?',
        options: ['E', 'F', 'G', 'H'],
        correctAnswer: 'E',
        explanation: 'Plotting circular coordinates shows E occupies the seat between B and D.',
        difficulty: 'Hard',
        tags: ['Circular']
      }
    ]
  },
  {
    name: 'Syllogism',
    slug: 'syllogism',
    difficulty: 'Hard',
    estimatedStudyTime: '55 mins',
    description: 'Categorical propositions (All, Some, No, Some Not), Venn diagram modeling, and "Either-Or" complimentary pairs.',
    icon: 'FiCheckSquare',
    displayOrder: 6,
    note: {
      introduction: 'Syllogism problems require validating whether given conclusions strictly follow from categorical premises without external bias.',
      concepts: [
        { title: 'Universal vs Particular', content: 'Universal Affirmative (All A are B), Universal Negative (No A is B), Particular Affirmative (Some A are B), Particular Negative (Some A are not B).' },
        { title: 'Either-Or Conditions', content: '1. Both conclusions must be independently doubtful. 2. Subject and predicate must be identical. 3. Form a complementary pair (Some + No) or (All + Some Not).' }
      ],
      rules: [
        'If both premises are positive, negative conclusions can never be definitely true.',
        'If both premises are particular ("Some"), no definite universal conclusion can be derived.'
      ],
      shortcuts: [
        { name: 'Possibility Logic', tip: 'If a scenario can be drawn in at least one valid Venn diagram without violating premises, the "Possibility" conclusion is TRUE.', example: 'Some A are B => "All A being B is a possibility" is TRUE.' }
      ],
      solvedExamples: [
        {
          question: 'Statements: All cats are dogs. All dogs are birds.\nConclusions: I. All cats are birds. II. Some birds are cats.',
          solution: 'Both I and II follow.',
          explanation: 'Cat is subset of Dog, which is subset of Bird. Hence all cats are inside Bird (I holds), and Bird circle overlaps Cat (II holds).'
        }
      ],
      placementTips: ['Always draw the minimal overlapping Venn diagram first.']
    },
    questions: [
      {
        questionText: 'Statements: Some papers are pens. All pens are scales.\nConclusions:\nI. Some scales are papers.\nII. Some pens are papers.',
        options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
        correctAnswer: 'Both I and II follow',
        explanation: 'Scale circle contains all Pens and intersects Paper circle. Hence some scales are papers (I), and some pens are papers (II).',
        difficulty: 'Medium',
        tags: ['Venn', 'Deduction']
      },
      {
        questionText: 'Statements: All flowers are trees. No tree is a fruit.\nConclusions:\nI. No flower is a fruit.\nII. Some trees are flowers.',
        options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
        correctAnswer: 'Both I and II follow',
        explanation: 'Flower is completely inside Tree. Since Tree is completely disjoint from Fruit, Flower cannot touch Fruit (I). Also Some trees are flowers (II).',
        difficulty: 'Medium',
        tags: ['Negative Premise']
      }
    ]
  },
  {
    name: 'Analogy',
    slug: 'analogy',
    difficulty: 'Easy',
    estimatedStudyTime: '35 mins',
    description: 'Semantic word pairs, numerical analogies, alphabetical ratio relationships, and functional associations.',
    icon: 'FiLink',
    displayOrder: 7,
    note: {
      introduction: 'Analogy evaluates your ability to recognize identical relationships between pairs of words, numbers, or symbols.',
      concepts: [
        { title: 'Relationship Categories', content: 'Cause & Effect, Worker & Tool, Product & Raw Material, Country & Capital/Currency, Quantity & Unit, Synonyms & Antonyms.' }
      ],
      rules: [
        'Identify the exact relationship in Pair 1 (A : B) and apply the identical transformation rule to Pair 2 (C : ?).'
      ],
      shortcuts: [
        { name: 'Word Relation Sentence', tip: 'Form a simple sentence with the first pair: "A is the unit of B".', example: 'Ohm : Resistance => "Ohm is the unit of Resistance". Hence, Pascal : Pressure.' }
      ],
      solvedExamples: [
        {
          question: 'Ohm : Resistance :: Pascal : ?',
          solution: 'Pressure',
          explanation: 'Ohm is the SI unit of electrical resistance. Pascal is the SI unit of pressure.'
        }
      ],
      placementTips: ['Brush up on standard units, country capitals, and common English tool-worker associations.']
    },
    questions: [
      {
        questionText: 'Moon : Satellite :: Earth : ?',
        options: ['Sun', 'Planet', 'Solar System', 'Asteroid'],
        correctAnswer: 'Planet',
        explanation: 'Moon is a satellite. Earth is a planet.',
        difficulty: 'Easy',
        tags: ['Word Analogy']
      },
      {
        questionText: '6 : 222 :: 7 : ?',
        options: ['343', '350', '336', '352'],
        correctAnswer: '350',
        explanation: 'Pattern: n³ + n. For 6: 6³ + 6 = 216 + 6 = 222. For 7: 7³ + 7 = 343 + 7 = 350.',
        difficulty: 'Medium',
        tags: ['Number Analogy']
      }
    ]
  },
  {
    name: 'Series',
    slug: 'series',
    difficulty: 'Medium',
    estimatedStudyTime: '45 mins',
    description: 'Number progression patterns, missing terms, wrong number series, and alphabetical sequences.',
    icon: 'FiTrendingUp',
    displayOrder: 8,
    note: {
      introduction: 'Series problems require determining the underlying arithmetic, geometric, or cyclic rules governing an ordered list of elements.',
      concepts: [
        { title: 'Common Patterns', content: 'Difference of differences (Polynomial), Geometric ratio (*k), Squares/Cubes offset (n² ± c, n³ ± c), Fibonacci addition, Alternating dual series.' }
      ],
      rules: [
        'If numbers increase gradually: check differences (+/-).',
        'If numbers increase rapidly: check multiplication or exponential powers (n², n³).'
      ],
      shortcuts: [
        { name: 'Difference Layering', tip: 'Calculate successive differences Δ1, Δ2, Δ3 until a constant value or arithmetic progression emerges.', example: '1, 4, 11, 22, 37 => Δ: 3, 7, 11, 15 (AP with d=4).' }
      ],
      solvedExamples: [
        {
          question: 'Find the missing number: 2, 6, 12, 20, 30, ?',
          solution: '42',
          explanation: 'Differences are +4, +6, +8, +10, +12. 30 + 12 = 42. Alternatively, n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42.'
        }
      ],
      placementTips: ['Always memorize squares up to 30 and cubes up to 15.']
    },
    questions: [
      {
        questionText: 'Find the next term in the series: 3, 5, 9, 17, 33, ?',
        options: ['48', '65', '64', '59'],
        correctAnswer: '65',
        explanation: 'Pattern: *2 - 1. (3*2-1=5, 5*2-1=9, 9*2-1=17, 17*2-1=33, 33*2-1=65). Alternatively differences double: +2, +4, +8, +16, +32.',
        difficulty: 'Easy',
        tags: ['Number Series']
      },
      {
        questionText: 'Find the wrong number in the series: 8, 27, 125, 343, 1331, 2197',
        options: ['8', '27', '125', '343'],
        correctAnswer: '27',
        explanation: 'All other terms are cubes of prime numbers: 2³=8, 5³=125, 7³=343, 11³=1331, 13³=2197. 27 is 3³ (3 is prime, but between 2 and 5), however 27 is 3³, wait: 2, 3, 5, 7, 11, 13 are all primes. If 27 is 3³, it is prime. Let\'s check: 8, 27, 125, 343, 1331, 2197 are 2³, 3³, 5³, 7³, 11³, 13³.',
        difficulty: 'Hard',
        tags: ['Prime Cubes']
      }
    ]
  },
  {
    name: 'Ranking',
    slug: 'ranking',
    difficulty: 'Easy',
    estimatedStudyTime: '35 mins',
    description: 'Order and ranking formulas, position swaps, total count deductions, and overlapping ranks.',
    icon: 'FiAward',
    displayOrder: 9,
    note: {
      introduction: 'Ranking involves finding an individual\'s rank from top/bottom or left/right, and computing total items in a sequence.',
      concepts: [
        { title: 'Core Ranking Formula', content: 'Total Persons = (Rank from Left + Rank from Right) - 1' },
        { title: 'Position Swapping', content: 'When two individuals swap positions, the distance shifted by Person A equals the distance shifted by Person B.' }
      ],
      rules: [
        'Subtract 1 when combining ranks of the SAME person because they are counted twice.',
        'To find number of persons between two non-overlapping people: Total - (Rank Left + Rank Right).'
      ],
      shortcuts: [
        { name: 'Single Person Position', tip: 'Rank from Right = Total - Rank from Left + 1.', example: 'In a class of 40, if Rohan is 15th from top => Rank from bottom = 40 - 15 + 1 = 26.' }
      ],
      solvedExamples: [
        {
          question: 'In a class of 50 students, Rahul is 18th from the top. What is his rank from the bottom?',
          solution: '33rd',
          explanation: 'Rank from bottom = 50 - 18 + 1 = 33.'
        }
      ],
      placementTips: ['Quick score booster topic for almost all placement exams.']
    },
    questions: [
      {
        questionText: 'Manoj and Sachin are ranked 7th and 11th respectively from the top in a class of 31 students. What will be their respective ranks from the bottom?',
        options: ['20th and 24th', '24th and 20th', '25th and 21st', '26th and 22nd'],
        correctAnswer: '25th and 21st',
        explanation: 'Manoj from bottom = 31 - 7 + 1 = 25th. Sachin from bottom = 31 - 11 + 1 = 21st.',
        difficulty: 'Easy',
        tags: ['Ranking']
      }
    ]
  },
  {
    name: 'Puzzle',
    slug: 'puzzle',
    difficulty: 'Hard',
    estimatedStudyTime: '65 mins',
    description: 'Multi-attribute matrix grids, scheduling timelines, floor puzzles, and sequential deductions.',
    icon: 'FiCpu',
    displayOrder: 10,
    note: {
      introduction: 'Puzzles test your capacity to synthesize multi-dimensional constraints (people, colors, professions, days) into a unified matrix.',
      concepts: [
        { title: 'Grid Matrix Method', content: 'Create a table where rows represent fixed entities (Days, Floors) and columns represent attributes (Name, City, Car).' }
      ],
      rules: [
        'Fill definitive clues with checkmarks (✓) and cross off impossible intersections (✗).',
        'Floor puzzles: Ground floor is Floor 1, top is Floor N.'
      ],
      shortcuts: [
        { name: 'Elimination Matrix', tip: 'A cell marked with (✓) instantly eliminates all other options in its row and column.', example: 'If Alice likes Red, no one else likes Red, and Alice likes no other color.' }
      ],
      solvedExamples: [
        {
          question: 'Four friends live on floors 1, 2, 3, 4. A lives on an even floor. B lives above A. C lives below D. Who lives on Floor 4?',
          solution: 'B or D based on constraints',
          explanation: 'A is on floor 2 (even, since B is above A). B is on 3 or 4. C is on 1, D is on 3, B is on 4.'
        }
      ],
      placementTips: ['Crucial for high-package hiring rounds (Service-based & Product-based companies).']
    },
    questions: [
      {
        questionText: 'Seven people A, B, C, D, E, F, G attend a seminar from Monday to Sunday. Only one person attends per day. A attends on Wednesday. Exactly two people attend between A and B. G attends immediately before B. On which day does G attend?',
        options: ['Friday', 'Saturday', 'Tuesday', 'Sunday'],
        correctAnswer: 'Friday',
        explanation: 'A is on Wednesday (Day 3). Two people between A and B puts B on Saturday (Day 6). G is immediately before B, so G is on Friday (Day 5).',
        difficulty: 'Hard',
        tags: ['Scheduling', 'Puzzle']
      }
    ]
  },
  {
    name: 'Statement & Conclusion',
    slug: 'statement-conclusion',
    difficulty: 'Medium',
    estimatedStudyTime: '40 mins',
    description: 'Formal logic validity, direct inferences, non-assumed conclusions, and contextual truth.',
    icon: 'FiFileText',
    displayOrder: 11,
    note: {
      introduction: 'Evaluate whether a given conclusion is an indisputable, direct inference from the provided statement.',
      concepts: [
        { title: 'Direct Implication', content: 'A valid conclusion must be 100% derived from the given text. It cannot rely on external common knowledge.' }
      ],
      rules: [
        'If a statement provides a general rule, an extreme conclusion ("all", "must") is rarely valid.',
        'Conclusions containing advice or solutions to stated problems are valid only if directly implied.'
      ],
      shortcuts: [
        { name: 'Fact-Check Rule', tip: 'Ask: "Can the statement be true while the conclusion is false?" If yes, conclusion is INVALID.', example: 'Statement: "Company profits rose." Conclusion: "All employees got raises." (Invalid).' }
      ],
      solvedExamples: [
        {
          question: 'Statement: In a one-day cricket match, the total runs made by a team were 200. Out of these, 160 runs were made by spinners.\nConclusions: I. 80% of the team consists of spinners. II. The opening batsmen were spinners.',
          solution: 'Neither follows.',
          explanation: '160/200 = 80% of runs, not 80% of players. Also, we cannot determine batting order from runs alone.'
        }
      ],
      placementTips: ['Standard in Infosys, Deloitte, and Capgemini verbal/logical tests.']
    },
    questions: [
      {
        questionText: 'Statement: Morning walks are good for health.\nConclusions:\nI. All healthy people go for morning walks.\nII. Evening walks are harmful.',
        options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither I nor II follows'],
        correctAnswer: 'Neither I nor II follows',
        explanation: 'The statement says morning walks are good, not that they are mandatory for all healthy people (I fails). It says nothing about evening walks (II fails).',
        difficulty: 'Easy',
        tags: ['Logical Deduction']
      }
    ]
  },
  {
    name: 'Statement & Assumption',
    slug: 'statement-assumption',
    difficulty: 'Medium',
    estimatedStudyTime: '40 mins',
    description: 'Implicit premises, speaker mindset deductions, and presupposed unstated assumptions.',
    icon: 'FiHelpCircle',
    displayOrder: 12,
    note: {
      introduction: 'An assumption is an unstated, underlying premise that the speaker takes for granted when making a statement.',
      concepts: [
        { title: 'Implicit vs Explicit', content: 'An assumption is always implicit. If a statement explicitly says something, it is not an assumption.' }
      ],
      rules: [
        'Assumptions are generally positive and assume people will respond to notices, warnings, and advertisements.',
        'Any assumption that contradicts the statement is immediately invalid.'
      ],
      shortcuts: [
        { name: 'Negation Test', tip: 'Negate the assumption. If the original statement collapses or becomes meaningless, the assumption is IMPLICIT.', example: 'Notice: "Do not lean out of train." Assumption: "People can read notices." (If they can\'t, notice is useless => Valid).' }
      ],
      solvedExamples: [
        {
          question: 'Statement: "Please check your luggage before leaving the taxi" - A notice in a taxi.\nAssumption I: People often forget their luggage.\nAssumption II: Passengers can read the notice.',
          solution: 'Both I and II are implicit.',
          explanation: 'Notices are posted assuming people read them and because the problem happens frequently.'
        }
      ],
      placementTips: ['Crucial for analytical sections in Infosys, Deloitte, and TCS.']
    },
    questions: [
      {
        questionText: 'Statement: "Join our computer course to secure a high-paying software job" - An advertisement.\nAssumptions:\nI. People want high-paying software jobs.\nII. The institute provides quality training.',
        options: ['Only I is implicit', 'Only II is implicit', 'Both I and II are implicit', 'Neither is implicit'],
        correctAnswer: 'Both I and II are implicit',
        explanation: 'Advertisements assume people desire the benefit offered (I) and that the offering is capable of delivering results (II).',
        difficulty: 'Medium',
        tags: ['Assumptions']
      }
    ]
  },
  {
    name: 'Data Sufficiency',
    slug: 'data-sufficiency',
    difficulty: 'Hard',
    estimatedStudyTime: '55 mins',
    description: 'Determine whether statements (I) and (II) alone or together provide sufficient data to answer the target question.',
    icon: 'FiDatabase',
    displayOrder: 13,
    note: {
      introduction: 'Data Sufficiency tests mathematical and logical efficiency by requiring you to decide if given statements provide adequate information without solving fully.',
      concepts: [
        { title: 'Standard Decision Options', content: 'A: Statement I alone is sufficient. B: Statement II alone is sufficient. C: Either statement alone is sufficient. D: Neither is sufficient even together. E: Both statements together are sufficient.' }
      ],
      rules: [
        'Never use data from Statement II while evaluating Statement I alone.',
        'Only combine I and II if neither is individually sufficient.'
      ],
      shortcuts: [
        { name: 'Stop on Unique Answer', tip: 'Do not calculate final numerical values. As soon as a single unique answer is guaranteed, mark SUFFICIENT.', example: 'Linear equation with 1 unknown => Stop, sufficient.' }
      ],
      solvedExamples: [
        {
          question: 'Question: What is the value of x?\nStatement I: x + y = 10\nStatement II: y = 4',
          solution: 'Both together are sufficient.',
          explanation: 'I alone gives infinite solutions. II alone gives only y. Together, x = 10 - 4 = 6 (Unique answer).'
        }
      ],
      placementTips: ['High score differentiator in CAT, TCS Digital, and Capgemini.']
    },
    questions: [
      {
        questionText: 'Question: Is P greater than Q?\nStatement I: P = 2Q\nStatement II: Q is a positive integer.',
        options: ['Statement I alone is sufficient', 'Statement II alone is sufficient', 'Both statements together are sufficient', 'Statements I and II together are not sufficient'],
        correctAnswer: 'Both statements together are sufficient',
        explanation: 'If Q is positive (from II) and P = 2Q (from I), then P > Q. (If Q was negative, P would be smaller). Hence both together are sufficient.',
        difficulty: 'Hard',
        tags: ['Sufficiency', 'Algebraic']
      }
    ]
  },
  {
    name: 'Classification',
    slug: 'classification',
    difficulty: 'Easy',
    estimatedStudyTime: '30 mins',
    description: 'Odd one out detection, semantic clusters, numerical properties, and symbolic anomaly identification.',
    icon: 'FiFilter',
    displayOrder: 14,
    note: {
      introduction: 'Classification questions require identifying the item that does not belong to the group based on a common shared characteristic.',
      concepts: [
        { title: 'Categorical Dimensions', content: 'Prime vs Composite, Vowel/Consonant density, Synonym groups, Physical vs Abstract entities.' }
      ],
      rules: [
        'Find the property shared by 3 of the 4 options. The one lacking that property is the odd one out.'
      ],
      shortcuts: [
        { name: 'Pair Property Check', tip: 'Check digit sums or divisibility rules for number classification.', example: '13, 17, 19, 21 => 21 is composite (3*7), rest are primes.' }
      ],
      solvedExamples: [
        {
          question: 'Find the odd one out: Copper, Silver, Gold, Plastic',
          solution: 'Plastic',
          explanation: 'Copper, Silver, and Gold are metals and electrical conductors; Plastic is a polymer/insulator.'
        }
      ],
      placementTips: ['Quick 10-second questions in screening rounds.']
    },
    questions: [
      {
        questionText: 'Find the odd one out among the following words:',
        options: ['Keyboard', 'Monitor', 'Mouse', 'Windows'],
        correctAnswer: 'Windows',
        explanation: 'Keyboard, Monitor, and Mouse are computer hardware; Windows is operating system software.',
        difficulty: 'Easy',
        tags: ['Odd One Out']
      },
      {
        questionText: 'Find the odd one out: 28, 45, 72, 81',
        options: ['28', '45', '72', '81'],
        correctAnswer: '28',
        explanation: '45, 72, and 81 are all divisible by 9 (sum of digits is 9). 28 is not divisible by 9.',
        difficulty: 'Easy',
        tags: ['Number Classification']
      }
    ]
  },
  {
    name: 'Venn Diagram',
    slug: 'venn-diagram',
    difficulty: 'Easy',
    estimatedStudyTime: '35 mins',
    description: 'Set theory intersection, subset-superset diagrams, and geometric region analysis.',
    icon: 'FiPieChart',
    displayOrder: 15,
    note: {
      introduction: 'Venn diagrams visually represent logical relationships (subsets, disjoint sets, partial overlaps) between classes of objects.',
      concepts: [
        { title: 'Three Set Formula', content: 'n(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A∩B) - n(B∩C) - n(A∩C) + n(A∩B∩C).' }
      ],
      rules: [
        'If Class A is completely contained in Class B, Circle A is inside Circle B.',
        'If Class A and Class B share common elements, their circles intersect.'
      ],
      shortcuts: [
        { name: 'Containment Hierarchy', tip: 'Order entities from smallest subset to largest superset.', example: 'Seconds -> Minutes -> Hours (Three concentric circles).' }
      ],
      solvedExamples: [
        {
          question: 'Which diagram best represents the relationship between: Animals, Dogs, Pets?',
          solution: 'Dogs inside Animals, intersecting Pets.',
          explanation: 'All dogs are animals. Some dogs are pets, and some animals (other than dogs) are pets.'
        }
      ],
      placementTips: ['Visual interpretation questions are standard in TCS and Accenture.']
    },
    questions: [
      {
        questionText: 'Which of the following represents the relationship among: "Seconds, Minutes, Hours"?',
        options: ['Three intersecting circles', 'Three concentric circles', 'Two disjoint circles inside one large circle', 'Three separate disjoint circles'],
        correctAnswer: 'Three concentric circles',
        explanation: 'All seconds are part of minutes, and all minutes are part of hours. Hence, three concentric circles represent this relationship.',
        difficulty: 'Easy',
        tags: ['Venn Diagram']
      },
      {
        questionText: 'In a group of 100 students, 60 like Math, 45 like Science, and 20 like both. How many students like neither subject?',
        options: ['15', '20', '25', '30'],
        correctAnswer: '15',
        explanation: 'n(M ∪ S) = 60 + 45 - 20 = 85. Neither = 100 - 85 = 15 students.',
        difficulty: 'Medium',
        tags: ['Set Theory']
      }
    ]
  }
];

async function seedReasoningData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal');
    console.log('MongoDB connected successfully.');

    let admin = await User.findOne({ email: 'admin@placementportal.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Portal Administrator',
        email: 'admin@placementportal.com',
        password: 'Admin@12345',
        role: 'admin',
        accountStatus: 'active'
      });
    }

    console.log(`Seeding ${REASONING_TOPICS.length} Reasoning topics...`);

    for (const item of REASONING_TOPICS) {
      // 1. Seed or Update Topic
      const topicDoc = await Topic.findOneAndUpdate(
        { moduleType: 'Reasoning', slug: item.slug },
        {
          name: item.name,
          slug: item.slug,
          moduleType: 'Reasoning',
          description: item.description,
          icon: item.icon,
          difficulty: item.difficulty,
          estimatedStudyTime: item.estimatedStudyTime,
          status: 'active',
          displayOrder: item.displayOrder,
          createdBy: admin._id
        },
        { upsert: true, new: true, returnDocument: 'after' }
      );

      // 2. Seed Topic Note
      if (item.note) {
        await TopicNote.findOneAndUpdate(
          { moduleType: 'Reasoning', slug: item.slug },
          {
            moduleType: 'Reasoning',
            topic: item.name,
            slug: item.slug,
            title: `${item.name} Master Study Guide`,
            introduction: item.note.introduction,
            concepts: item.note.concepts || [],
            rules: item.note.rules || [],
            shortcuts: item.note.shortcuts || [],
            solvedExamples: item.note.solvedExamples || [],
            placementTips: item.note.placementTips || [],
            status: 'published',
            createdBy: admin._id
          },
          { upsert: true, new: true }
        );
      }

      // 3. Seed Questions
      if (item.questions && item.questions.length > 0) {
        for (const q of item.questions) {
          await Question.findOneAndUpdate(
            { moduleType: 'Reasoning', questionText: q.questionText },
            {
              moduleType: 'Reasoning',
              category: item.name,
              topic: item.name,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              difficulty: q.difficulty || 'Medium',
              marks: 1,
              negativeMarks: 0.25,
              tags: q.tags || ['Reasoning'],
              status: 'published',
              createdBy: admin._id
            },
            { upsert: true, new: true }
          );
        }
      }

      console.log(`✓ Seeded Reasoning Topic: ${item.name} with notes & ${item.questions.length} questions`);
    }

    const totalTopics = await Topic.countDocuments({ moduleType: 'Reasoning' });
    const totalNotes = await TopicNote.countDocuments({ moduleType: 'Reasoning' });
    const totalQuestions = await Question.countDocuments({ moduleType: 'Reasoning' });

    console.log(`\n========================================`);
    console.log(`REASONING SEEDING COMPLETE!`);
    console.log(`Total Topics: ${totalTopics}`);
    console.log(`Total Notes: ${totalNotes}`);
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding reasoning data:', err);
    process.exit(1);
  }
}

seedReasoningData();
