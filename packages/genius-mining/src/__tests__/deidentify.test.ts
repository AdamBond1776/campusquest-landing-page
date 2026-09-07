import { describe, expect, it } from 'vitest';
import fixture from '../../assets/fixtures/example_response_GM000.json';
import { DeidentificationError, deidentify } from '../deidentify';
import { resolveD1 } from '../resolve-d1';
import type { QuestionnaireResponses } from '../types';

const responses: QuestionnaireResponses = {
  ...(fixture as unknown as QuestionnaireResponses),
  name: 'Nick Delvecchio',
  date: '2026-09-01',
  instrument_version: '1.3',
};

const input = {
  responses,
  primaryWorkingWord: 'FIXER' as const,
  confidence: 'HIGH' as const,
  d1Resolution: resolveD1(responses.B, responses.C1),
  thinSpots: ['E2'],
};

describe('what the corpus keeps', () => {
  it('keeps the answers the instrument needs to be improved', () => {
    const record = deidentify(input);

    expect(record.C3).toBe(responses.C3);
    expect(record.A1).toHaveLength(6);
    expect(record.B).toHaveLength(6);
    expect(record.D3).toBe(responses.D3);
    expect(record.instrument_version).toBe('1.3');
  });

  it('keeps the finding alongside the answers that produced it', () => {
    const record = deidentify(input);

    expect(record.primary_working_word).toBe('FIXER');
    expect(record.confidence).toBe('HIGH');
    expect(record.d1_resolution.resolution).toBe('tie_broken_by_C1');
    expect(record.thin_spots).toEqual(['E2']);
  });

  it("keeps A4's three tags but not the activity the student named", () => {
    const record = deidentify(input);

    expect(record.A4_tags).toEqual([
      { mode: 'do', social: 'few friends', setting: 'indoors' },
      { mode: 'watch', social: 'crowd', setting: 'indoors' },
      { mode: 'do', social: 'alone', setting: 'outside' },
    ]);
    expect(JSON.stringify(record)).not.toContain('Mackal');
    expect(JSON.stringify(record)).not.toContain('Celtics');
  });
});

describe('what the corpus drops', () => {
  it('drops the name and the date', () => {
    const record = deidentify(input);

    expect(record).not.toHaveProperty('name');
    expect(record).not.toHaveProperty('date');
    expect(JSON.stringify(record)).not.toContain('Delvecchio');
  });

  it('drops the participant code, which is the join key back to the account', () => {
    const record = deidentify(input);

    expect(record).not.toHaveProperty('participant_code');
    expect(JSON.stringify(record)).not.toContain('GM-000');
  });

  it('drops E3, which is what the student had never said out loud', () => {
    const record = deidentify(input);

    expect(record).not.toHaveProperty('E3');
    // E3 is stored as { answer, which_question }; neither key survives.
    expect(JSON.stringify(record)).not.toContain('which_question');
    expect(JSON.stringify(record)).not.toContain('"answer"');
  });

  it('drops E2, where the student admits what they fudged', () => {
    const record = deidentify(input);
    expect(record).not.toHaveProperty('E2');
  });
});

describe('the corpus identifier', () => {
  it('is random, so the retained copy is anonymous rather than pseudonymous', () => {
    const first = deidentify(input);
    const second = deidentify(input);

    expect(first.corpus_id).toMatch(/^gmc_[0-9a-f]{32}$/);
    expect(first.corpus_id).not.toBe(second.corpus_id);
  });
});

describe('failing loudly', () => {
  // The purge must not proceed when this throws. Losing the corpus copy is worse
  // than a late deletion, so a failure here alerts a human instead of retrying
  // on a schedule nobody is watching.
  it('refuses to write a record with no C3 to learn from', () => {
    expect(() => deidentify({ ...input, responses: { ...responses, C3: '' } })).toThrow(
      DeidentificationError
    );
  });

  it('refuses to write a record with no instances', () => {
    expect(() => deidentify({ ...input, responses: { ...responses, A1: [] } })).toThrow(
      DeidentificationError
    );
  });
});
