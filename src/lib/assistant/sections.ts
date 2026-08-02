/**
 * The scrollable sections on the page. `action.target` from the model is
 * validated against this list before the client is allowed to scroll anywhere.
 *
 * These ids must stay in sync with the `id=` attributes rendered in
 * src/app/page.tsx's section components.
 */

export const SECTION_IDS = [
    'home',
    'about',
    'experience',
    'projects',
    'github',
    'skills',
    'education',
    'certifications',
    'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

const isSectionId = (value: string): value is SectionId =>
    (SECTION_IDS as readonly string[]).includes(value);

/**
 * Normalises a loose section name to a real id. The model is told to emit a
 * canonical id, but it will occasionally reach for a synonym ("work",
 * "portfolio"), so map those rather than dropping the navigation.
 *
 * Ported from the old portfolio-data.ts, plus `github` — which is a real
 * section on the page but was missing from the original map.
 */
const SYNONYMS: Record<string, SectionId> = {
    work: 'experience',
    job: 'experience',
    jobs: 'experience',
    career: 'experience',
    portfolio: 'projects',
    project: 'projects',
    work_samples: 'projects',
    technologies: 'skills',
    tech: 'skills',
    stack: 'skills',
    certificates: 'certifications',
    certification: 'certifications',
    school: 'education',
    study: 'education',
    reach: 'contact',
    email: 'contact',
    top: 'home',
    hero: 'home',
    activity: 'github',
    contributions: 'github',
};

export const getSectionId = (name: string): SectionId | null => {
    const normalized = name.toLowerCase().trim().replace(/^#/, '');
    if (!normalized) return null;

    if (isSectionId(normalized)) return normalized;
    if (SYNONYMS[normalized]) return SYNONYMS[normalized];

    return null;
};
