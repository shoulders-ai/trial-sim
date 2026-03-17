// ─── Paper Excerpts ──────────────────────────────────────────────────────────
// Curated quotes and content from:
// "Clinical Trial Simulation: Planning With the OCTAVE Framework,
//  Implementation and Validation Principles"
// Kim May Lee et al., Statistics in Medicine, 2026; 45:e70449

export interface PaperExcerpt {
  id: string
  text: string
  section?: string
  isQuote: boolean // true = direct quote, false = paraphrase/summary
}

export interface SectionIntro {
  id: string
  label: string       // section label (small caps)
  heading: string     // section heading
  lead: string        // 1-2 sentence lead paragraph
  excerpts: PaperExcerpt[]
}

// ─── Section 1: Why Simulate? ────────────────────────────────────────────────

export const whySimulate: SectionIntro = {
  id: 'why-simulate',
  label: 'Why Simulate',
  heading: 'A single trial is one roll of the dice',
  lead: 'Complex innovative clinical trial designs offer efficiency gains, but their statistical properties are difficult to compute analytically. Simulation lets you see every possible outcome before committing to a design.',
  excerpts: [
    {
      id: 'intro-complexity',
      text: 'The motivation for complex innovative designs may not be difficult to follow, but their set-up and implementation is usually more challenging. Statistical properties of these designs can also be difficult to compute.',
      section: 'Section 1',
      isQuote: true,
    },
    {
      id: 'intro-cts-definition',
      text: 'A simulation study uses a computer program to learn about different situations to understand what might happen, instead of doing a real-world experiment.',
      section: 'Section 3',
      isQuote: true,
    },
    {
      id: 'intro-single-run',
      text: 'While a single simulation run may be illustrative of possible trial progress, the examination cannot capture the uncertainty in the data generating process to convey how the simulation design variant performs in expectation.',
      section: 'Section 3.1',
      isQuote: true,
    },
    {
      id: 'intro-repeated-runs',
      text: 'With multiple runs, we can study the outputs to understand the properties of a simulation design variant, for example, by examining summary statistics or by visually assessing variability.',
      section: 'Section 3.2',
      isQuote: true,
    },
  ],
}

// ─── Section 2: Statistical Foundation ───────────────────────────────────────

export const statisticalFoundation: SectionIntro = {
  id: 'statistical-foundation',
  label: 'Statistical Foundation',
  heading: 'The building blocks of trial design',
  lead: 'Every clinical trial rests on four statistical pillars: how patients are allocated, what error rates are tolerable, how many patients are needed, and what rules govern decisions during the trial.',
  excerpts: [],
}

export const randomizationExcerpts: PaperExcerpt[] = [
  {
    id: 'rand-purpose',
    text: 'Randomization methods are used to minimize selection bias and ensure that the data of the randomized groups are comparable with respect to unobserved confounding factors.',
    section: 'Section 2.1',
    isQuote: true,
  },
  {
    id: 'rand-categories',
    text: 'Existing randomization methods can be categorized into broad classes, with allocation probabilities: independent of patient data, depending on baseline characteristics, depending on observed outcomes, or depending on both.',
    section: 'Section 2.1',
    isQuote: true,
  },
]

export const errorRateExcerpts: PaperExcerpt[] = [
  {
    id: 'error-type1',
    text: 'A type I error is committed when the null hypothesis of no effect is rejected for a truly ineffective intervention. A type II error is committed when the null hypothesis is not rejected for an effective intervention.',
    section: 'Section 2.2',
    isQuote: true,
  },
  {
    id: 'error-design-aim',
    text: 'When designing a study, the aim is to control the probability of making a type I error at a low level (often 5%), and the probability of not making a type II error (the power) at a high level (often 80% or 90%).',
    section: 'Section 2.2',
    isQuote: true,
  },
  {
    id: 'error-complex',
    text: 'The family-wise error rate, per-comparison error rate, and false discovery rate are some of the options to consider for controlling false positive errors in trials that evaluate multiple interventions.',
    section: 'Section 2.2',
    isQuote: true,
  },
]

export const sampleSizeExcerpts: PaperExcerpt[] = [
  {
    id: 'ss-depends',
    text: 'Sample size calculation depends on the study aim, randomization method, error rates, parameters of the outcome distribution, target effect size, decision rules, missing values, and prior parameters.',
    section: 'Section 2.3',
    isQuote: true,
  },
  {
    id: 'ss-complex',
    text: 'More complex types of endpoints include ordered categorical, composite, and hierarchical composite endpoints, for which sample size calculation may require analytical calculation by approximation or optimization by conducting CTS.',
    section: 'Section 2.3',
    isQuote: true,
  },
]

export const decisionRuleExcerpts: PaperExcerpt[] = [
  {
    id: 'dr-purpose',
    text: 'Statistical decision rules guide trial activities and decision-making in a systematic way. In complex innovative designs with adaptive elements, they play a key role during earlier stages of the trial, particularly in guiding adaptations.',
    section: 'Section 2.4',
    isQuote: true,
  },
  {
    id: 'dr-adaptations',
    text: 'Interim analyses may trigger changes to various aspects of a trial: stopping recruitment, increasing sample size, adapting dosage, discontinuing intervention arms, modifying allocation probabilities, changing endpoints, and management of trial progress.',
    section: 'Section 2.4',
    isQuote: true,
  },
]

// ─── Section 3: OCTAVE Framework ─────────────────────────────────────────────

export const octaveIntro: SectionIntro = {
  id: 'octave',
  label: 'The OCTAVE Framework',
  heading: 'A systematic approach to planning simulation',
  lead: 'OCTAVE provides a structured framework for outlining every detail of a clinical trial simulation study. Each letter represents a component that must be specified before implementation.',
  excerpts: [
    {
      id: 'octave-definition',
      text: 'Writing up the details following this framework is similar to documenting a trial project in a protocol.',
      section: 'Section 4',
      isQuote: true,
    },
  ],
}

export const octaveComponents = {
  O: {
    letter: 'O',
    name: 'Objective',
    fullName: 'Objective(s) of conducting CTS',
    description: 'What are you trying to learn from the simulation? The objective determines what you hold constant and what you vary.',
    excerpt: {
      id: 'o-objectives',
      text: 'Setting clear objectives of conducting CTS allows one to identify the details that can be kept constant and those that can be varied across the test cases.',
      section: 'Section 4.1',
      isQuote: true,
    },
    objectives: [
      { id: 'examine-properties', label: 'Examine design properties', description: 'Fix the design, factors, and analysis. Evaluate operating characteristics under a specific scenario.', varies: { design: false, factors: false, analysis: false } },
      { id: 'compare-analyses', label: 'Compare analysis methods', description: 'Fix the design and factors. Test multiple analysis approaches on the same data.', varies: { design: false, factors: false, analysis: true } },
      { id: 'sensitivity-factors', label: 'Assess sensitivity to assumptions', description: 'Fix the design and analysis. Vary the underlying assumptions to see how robust the design is.', varies: { design: false, factors: true, analysis: false } },
      { id: 'compare-designs', label: 'Compare trial designs', description: 'Fix the factors and analysis. Compare different design configurations head-to-head.', varies: { design: true, factors: false, analysis: false } },
      { id: 'full-exploration', label: 'Full exploration', description: 'Vary everything. Investigate how design choice, assumptions, and analysis method interact.', varies: { design: true, factors: true, analysis: true } },
    ],
  },
  C: {
    letter: 'C',
    name: 'Characteristics',
    fullName: 'Characteristics of underlying factors',
    description: 'What assumptions do you make about the real world? These are variables that influence the trial but cannot be controlled by investigators.',
    excerpt: {
      id: 'c-factors',
      text: 'Many underlying variables can affect the trial set-up, conduct, and study findings. Investigators can select the specific underlying factors to consider in their simulation study, but unlike design parameters these factors have characteristics that cannot be altered by human intervention.',
      section: 'Section 4.2',
      isQuote: true,
    },
    factors: [
      { id: 'effect-size', label: 'Treatment effect', description: 'The actual difference between treatment and control in the population', adjustable: true },
      { id: 'variability', label: 'Response variability', description: 'Natural biological variability in how participants respond', adjustable: true },
      { id: 'accrual-rate', label: 'Accrual rate', description: 'How quickly participants can be enrolled', adjustable: true },
      { id: 'dropout', label: 'Dropout rate', description: 'The tendency of participants to withdraw from the study', adjustable: true },
      { id: 'time-trend', label: 'Time trend', description: 'Disease progression or temporal changes over the study duration', adjustable: false },
    ],
  },
  T: {
    letter: 'T',
    name: 'Trial Design',
    fullName: 'Trial design(s): one or more options',
    description: 'How will the trial be structured? These are the choices investigators can make and manipulate.',
    excerpt: {
      id: 't-design',
      text: 'We present design aspects that investigators can specify and manipulate, which combined with assumptions on underlying factors enable a data-generating mechanism to produce artificial data for exploration.',
      section: 'Section 4.3',
      isQuote: true,
    },
    designAspects: [
      'Randomization method',
      'Patient follow-up pattern',
      'Sample size',
      'Number and timing of interim analyses',
      'Statistical decision rules',
    ],
  },
  A: {
    letter: 'A',
    name: 'Analysis',
    fullName: 'Analysis methods: one or more approaches',
    description: 'How will you analyze the data? The choice of analysis method can change the conclusion even with identical data.',
    excerpt: {
      id: 'a-methods',
      text: 'It is imperative to decide the trial data analysis methods upfront, as the results can vary with the choice of the analysis methods. It has been shown that covariate adjustment at interim analyses of a multi-arm multi-stage design can lead to a different treatment selection outcome when compared to the use of a simple t-test.',
      section: 'Section 4.4',
      isQuote: true,
    },
  },
  V: {
    letter: 'V',
    name: 'Valuation',
    fullName: 'Valuation: measures to assess value',
    description: 'Is the complexity worth it? Statistical superiority alone does not justify a complex design.',
    excerpt: {
      id: 'v-value',
      text: 'Several studies have highlighted that the benefits of complex trial designs may not always outweigh the operational and analytical complexity they introduce.',
      section: 'Section 4.5',
      isQuote: true,
    },
    nonStatisticalMeasures: [
      'Average time to execute interim analyses',
      'Staff hours required per participant',
      'Additional months to approval compared with conventional designs',
      'Number of staff training sessions needed before trial launch',
    ],
  },
  E: {
    letter: 'E',
    name: 'Evidence',
    fullName: 'Evidence: reporting and reproducibility',
    description: 'How do you ensure your simulation is trustworthy? Documentation, validation, and honest reporting of uncertainty.',
    excerpt: {
      id: 'e-evidence',
      text: 'Clear CTS planning documentation should explicitly state which components vary and which remain fixed in the simulation. This supports appropriate planning of the simulation tasks especially when the number of test cases is large.',
      section: 'Section 4.6',
      isQuote: true,
    },
    mcseFormula: 'Monte Carlo simulation error for proportions: √(p(1−p)/r), where p is the estimated measure and r the number of replications.',
  },
} as const

// ─── Section 4: See It All Together ──────────────────────────────────────────

export const seeItTogether: SectionIntro = {
  id: 'see-it-together',
  label: 'See It All Together',
  heading: 'Your simulation, from single run to full evaluation',
  lead: 'The paper recommends a four-step approach for presenting simulation results: one run, then many runs, then metrics, then sensitivity analysis. Follow that progression now with the design you have configured.',
  excerpts: [
    {
      id: 'stakeholder-progression',
      text: 'Present from simple to complex, bearing in mind many stakeholders are not statisticians.',
      section: 'Section 6.3',
      isQuote: true,
    },
    {
      id: 'stakeholder-steps',
      text: 'Illustrate single run outputs first. Once single run details are understood, present performance metrics computed over replications. Then summarize underlying factor assumptions and their impact on findings.',
      section: 'Section 6.3',
      isQuote: true,
    },
  ],
}

// ─── Conclusion ──────────────────────────────────────────────────────────────

export const conclusion: SectionIntro = {
  id: 'conclusion',
  label: 'A Note of Caution',
  heading: 'Simulations model a simplified version of reality',
  lead: '',
  excerpts: [
    {
      id: 'conclusion-caution',
      text: 'By necessity, simulations model only a simplified version of the experiment as it will unfold in the real world. They capture key mechanisms but inevitably omit covert factors: unobserved influences like recruitment variability, site heterogeneity, and protocol deviations.',
      section: 'Section 7',
      isQuote: true,
    },
    {
      id: 'conclusion-conditional',
      text: 'Framing results conditionally reveals where design is robust and fragile. It is prudent to re-evaluate factors during the trial using observed values to update design assessment.',
      section: 'Section 7',
      isQuote: true,
    },
  ],
}

// ─── All sections in order ──────────────────────────────────────────────────

export const allSections = [
  whySimulate,
  statisticalFoundation,
  octaveIntro,
  seeItTogether,
  conclusion,
] as const
