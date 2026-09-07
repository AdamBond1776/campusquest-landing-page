import type {
  D1Resolution,
  QuestionnaireResponses,
  WorkingWord,
} from './types';

/**
 * A response set stripped of everything that points back at a person, ready for
 * the instrument-development corpus.
 *
 * The corpus outlives the student's account on purpose — the consent copy says
 * so plainly, and it says so because it is true. What makes that defensible is
 * that the record genuinely cannot be walked back to them, so this shape carries
 * a fresh random `corpus_id` and not the participant code. The participant code
 * is the join key to the student's account row; keeping it would make the corpus
 * pseudonymous while the consent screen calls it anonymous.
 */
export type CorpusRecord = {
  corpus_id: string;
  instrument_version: string;
  A1: { index: number; text: string }[];
  A2: string;
  A3: string;
  /** A4 keeps its three tags. The activity free text is dropped. */
  A4_tags: { mode: string; social: string; setting: string }[];
  B: { instance: number; verb: string }[];
  C1: number[];
  C2: string;
  C3: string;
  D1: string | null;
  D2: string | null;
  D3: string;
  E1?: string;
  primary_working_word: WorkingWord;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  d1_resolution: D1Resolution;
  thin_spots: string[];
};

export class DeidentificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeidentificationError';
  }
}

/**
 * Field ids that must not survive into the corpus.
 *
 * E2 is the student admitting what they skipped or fudged, and E3 is what they
 * had never said out loud. Neither is identifying on its own, but E3 is the
 * reason the support-resources block is not optional, and it is not the kind of
 * thing to keep in a corpus that outlives consent.
 */
const DROPPED_FIELDS = ['name', 'date', 'participant_code', 'A4', 'A4_consent', 'E2', 'E3'];

function randomCorpusId(): string {
  return `gmc_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
}

export type DeidentifyInput = {
  responses: QuestionnaireResponses;
  primaryWorkingWord: WorkingWord;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  d1Resolution: D1Resolution;
  thinSpots: string[];
};

/**
 * Builds the corpus record. Throws rather than returning a partial one.
 *
 * The caller must treat a throw as "do not purge, alert a human". Losing the
 * corpus copy is worse than a late deletion, so a failure here has to stop the
 * purge rather than be swallowed and retried on a schedule nobody is watching.
 */
export function deidentify(input: DeidentifyInput): CorpusRecord {
  const { responses, primaryWorkingWord, confidence, d1Resolution, thinSpots } = input;

  if (!responses.A1?.length || !responses.C3) {
    throw new DeidentificationError(
      'Response set is missing A1 or C3; refusing to write a corpus record that cannot inform the instrument.'
    );
  }

  const record: CorpusRecord = {
    corpus_id: randomCorpusId(),
    instrument_version: responses.instrument_version,
    A1: responses.A1.map((item) => ({ index: item.index, text: item.text })),
    A2: responses.A2,
    A3: responses.A3,
    A4_tags: (responses.A4 ?? []).map((entry) => ({
      mode: entry.mode,
      social: entry.social,
      setting: entry.setting,
    })),
    B: responses.B.map((tag) => ({ instance: tag.instance, verb: tag.verb })),
    C1: responses.C1,
    C2: responses.C2,
    C3: responses.C3,
    D1: responses.D1 ?? null,
    D2: responses.D2 ?? null,
    D3: responses.D3,
    E1: responses.E1,
    primary_working_word: primaryWorkingWord,
    confidence,
    d1_resolution: d1Resolution,
    thin_spots: thinSpots,
  };

  assertDeidentified(record);
  return record;
}

/** Verifies the corpus record before it is written. */
export function assertDeidentified(record: CorpusRecord): void {
  const keys = Object.keys(record);
  for (const dropped of DROPPED_FIELDS) {
    if (keys.includes(dropped)) {
      throw new DeidentificationError(`\`${dropped}\` must not survive de-identification.`);
    }
  }

  if (!record.corpus_id.startsWith('gmc_')) {
    throw new DeidentificationError('Corpus record is missing its random corpus id.');
  }
}
