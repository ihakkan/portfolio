/**
 * Profile Serializer
 *
 * Turns the two sources of truth into the markdown the model reads:
 *   1. src/lib/data.ts   — structured facts, already powering the visible site
 *   2. src/content/profile.ts — free prose the site doesn't render
 *
 * Fields are picked explicitly, never JSON.stringify'd. `data.ts` embeds React
 * components as values (SKILLS[].skills[].icon, CONTACT_INFO[].icon) which
 * stringify would silently drop, and `color`/`thumbnail`/`aiHint` are pure
 * token waste. Picking by hand also means a new decorative field added to
 * data.ts can never quietly inflate every prompt.
 *
 * Server-only. Do not import from a client component.
 */

import {
    ABOUT_ME,
    PROJECTS,
    SKILLS,
    EXPERIENCE,
    EDUCATION,
    CERTIFICATIONS,
    CONTACT_INFO,
    GITHUB_STATS,
    SOCIAL_LINKS,
} from '@/lib/data';
import { PROFILE_PROSE } from '@/content/profile';

/**
 * Contact entries the bot must never read out. The phone number is on the
 * site for humans, but an LLM will hand it to any scraper that asks politely.
 */
const PRIVATE_CONTACT_FIELDS = new Set(['Phone']);

// ============ Serialization ============

const buildProjects = (): string =>
    PROJECTS.map((p) => {
        const links = [
            p.liveUrl ? `live: ${p.liveUrl}` : null,
            p.repoUrl ? `repo: ${p.repoUrl}` : null,
        ].filter(Boolean).join(' | ');

        return [
            `### ${p.title}`,
            p.description,
            `Why he built it: ${p.why}`,
            `Tech: ${p.tags.join(', ')}`,
            links || 'No public links (closed source).',
        ].join('\n');
    }).join('\n\n');

const buildSkills = (): string =>
    SKILLS.map((c) => `- ${c.name}: ${c.skills.map((s) => s.name).join(', ')}`).join('\n');

const buildExperience = (): string =>
    EXPERIENCE.map((e) => {
        const d = e.details;
        return [
            `### ${e.role} — ${e.company} (${e.period})`,
            e.description,
            d.overview,
            `What he did: ${d.responsibilities.join('; ')}`,
            `Achievements: ${d.achievements.join('; ')}`,
            `Tech: ${d.technologies.join(', ')}`,
            // His own wry take on the role. The best voice reference in the
            // repo — the model should absorb the register, not quote it.
            `How he privately describes it: ${e.reality}`,
            `The unvarnished version of the work: ${d.realityResponsibilities.join('; ')}`,
            `The unvarnished version of the wins: ${d.realityAchievements.join('; ')}`,
            e.offerLetter ? 'An offer letter for this role is viewable on the site.' : null,
        ].filter(Boolean).join('\n');
    }).join('\n\n');

const buildGitHub = (): string => {
    const g = GITHUB_STATS;
    return [
        `Username: ${g.username} (https://github.com/${g.username})`,
        `Public repositories: ${g.publicRepos}`,
        `Pull requests merged: ${g.totalPRs}`,
        `Longest contribution streak: ${g.longestStreak.days} days (${g.longestStreak.period})`,
        `Most-used language: ${g.topLanguage}`,
        `Language split: ${g.languages.map((l) => `${l.name} ${l.percentage}%`).join(', ')}`,
        `GitHub achievement badges: ${g.achievements.map((a) => a.name + (a.badge ? ` (${a.badge})` : '')).join(', ')}`,
        'The GitHub section of the site also shows a live contribution calendar for the past year. Those daily counts are fetched live and are not available to you — point people at the section instead of guessing numbers.',
    ].join('\n');
};

const buildEducation = (): string =>
    EDUCATION.map((e) => `- ${e.degree}, ${e.institution} (${e.period}) — ${e.details}`).join('\n');

const buildCertifications = (): string =>
    CERTIFICATIONS.map((c) => `- ${c.name} — ${c.issuer}. Certificate: ${c.url}`).join('\n');

const buildContact = (): string => {
    const contacts = CONTACT_INFO
        .filter((c) => !PRIVATE_CONTACT_FIELDS.has(c.name))
        .map((c) => `- ${c.name}: ${c.value} (${c.href})`);

    const socials = SOCIAL_LINKS.map((s) => `- ${s.name}: ${s.url}`);

    return [...new Set([...contacts, ...socials])].join('\n');
};

const buildFacts = (): string => [
    '## Bio',
    ABOUT_ME,
    '',
    '## Work experience (most recent first)',
    buildExperience(),
    '',
    '## Projects',
    buildProjects(),
    '',
    '## Skills',
    buildSkills(),
    '',
    '## Education',
    buildEducation(),
    '',
    '## Certifications',
    buildCertifications(),
    '',
    '## GitHub',
    buildGitHub(),
    '',
    '## Contact and links',
    buildContact(),
].join('\n');

/**
 * The full grounding corpus. Computed once per server instance — `data.ts` and
 * `profile.ts` are static imports, so there is nothing to invalidate.
 */
export const PROFILE_BASE: string = `${buildFacts()}\n\n---\n\n${PROFILE_PROSE.trim()}`;

// ============ On-demand project detail ============

/**
 * Words a visitor is likely to use that don't appear in a project's title.
 * Values must match PROJECTS[].title exactly; the dev-mode check below catches
 * it if a title is renamed and an alias is left dangling.
 */
const PROJECT_ALIASES: Record<string, string> = {
    'ohm': 'OHMSchool',
    'school': 'OHMSchool',
    'agent': 'AURA',
    'openclaw': 'AURA',
    'streak': 'Commit Habit',
    'interview': 'MockHick',
    'mock': 'MockHick',
    'network speed': 'Throughput',
    'speed test': 'Throughput',
    'resume builder': 'BuildMyCV',
    'cv': 'BuildMyCV',
    'deepfake': 'VerifyAI',
    'fake news': 'VerifyAI',
    'rubik': "Rubik's Cube Solver",
    'cube': "Rubik's Cube Solver",
    'confession': 'ConfessCode',
    'dating': 'MemeMate',
    'meme': 'MemeMate',
    'chatbot': 'AluChat',
    'reels': 'ReelXtract',
    'instagram': 'ReelXtract',
    'calculator': 'Math-O-Matic',
    'whack': 'Hit-The-Jhatu',
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '');

/**
 * Cheap relevance check — no embeddings, no index. The corpus is ~15 KB, so a
 * substring scan beats a vector store that would add a network round trip to
 * the hot path and a stale-index failure mode.
 *
 * Returns at most 2 titles, in the order they appear in PROJECTS.
 */
export const matchProjects = (query: string): string[] => {
    const q = normalize(query);
    const hits = new Set<string>();

    for (const p of PROJECTS) {
        if (q.includes(normalize(p.title))) hits.add(p.title);
    }

    for (const [alias, title] of Object.entries(PROJECT_ALIASES)) {
        if (q.includes(alias)) hits.add(title);
    }

    return PROJECTS.map((p) => p.title).filter((t) => hits.has(t)).slice(0, 2);
};

/** The long-form write-up for one project, injected only when it's relevant. */
export const getProjectDetail = (title: string): string | null => {
    const p = PROJECTS.find((x) => x.title === title);
    if (!p) return null;

    return [
        `### ${p.title} — full detail`,
        p.longDescription,
        `Why he built it: ${p.why}`,
    ].join('\n');
};

// ============ Dev-only sanity checks ============

if (process.env.NODE_ENV !== 'production') {
    const titles = new Set(PROJECTS.map((p) => p.title));
    const dangling = Object.entries(PROJECT_ALIASES)
        .filter(([, title]) => !titles.has(title))
        .map(([alias, title]) => `"${alias}" -> "${title}"`);

    if (dangling.length) {
        console.warn(`[profile] project aliases point at titles that no longer exist: ${dangling.join(', ')}`);
    }

    const approxTokens = Math.round(PROFILE_BASE.length / 4);
    console.info(`[profile] grounding corpus: ${PROFILE_BASE.length} chars, ~${approxTokens} tokens`);
    if (approxTokens > 6000) {
        console.warn(`[profile] over the ~6k budget — trim data.ts or profile.ts, or expect Groq TPM limits to bite`);
    }
}
