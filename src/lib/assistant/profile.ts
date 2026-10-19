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

interface ProfileSection {
    heading: string;
    body: string;
    /**
     * Small enough that omitting it saves nothing worth the risk of the model
     * missing a fact. These add up to roughly 900 tokens in total.
     */
    always: boolean;
    /** Signals that this section is what the question is actually about. */
    cues?: RegExp;
}

/**
 * The three expensive sections — work experience, projects and the prose —
 * are most of the corpus. Everything else is cheap.
 */
const SECTIONS: ProfileSection[] = [
    { heading: '## Bio', body: ABOUT_ME, always: true },
    {
        heading: '## Work experience (most recent first)',
        body: buildExperience(),
        always: false,
        cues: /\b(work|worked|working|job|jobs|role|roles|experience|career|intern|internship|employer|compan(?:y|ies)|position|hire|hiring|available|freelance|persist|startup|professional|team)\b/i,
    },
    {
        heading: '## Projects',
        body: buildProjects(),
        always: false,
        cues: /\b(project|projects|built|build|building|made|make|created|shipped|app|apps|product|products|portfolio|demo|repo|side.?project|open.?source)\b/i,
    },
    { heading: '## Skills', body: buildSkills(), always: true },
    { heading: '## Education', body: buildEducation(), always: true },
    { heading: '## Certifications', body: buildCertifications(), always: true },
    { heading: '## GitHub', body: buildGitHub(), always: true },
    { heading: '## Contact and links', body: buildContact(), always: true },
    {
        heading: '## In his own words',
        body: PROFILE_PROSE.trim(),
        always: false,
        cues: /\b(who|about|story|background|himself|person|personality|why|motivat\w*|believ\w*|approach|philosoph\w*|values?|style|interest\w*|hobb\w*|describe|introduce|tell me)\b/i,
    },
];

const buildFacts = (): string =>
    SECTIONS.map((section) => `${section.heading}\n${section.body}`).join('\n\n');

/**
 * A one-line index of what exists, for questions we couldn't classify. Lets
 * the model answer "what do you know?" and offer detail without carrying the
 * full projects and experience sections on every unclassified turn.
 */
const buildDigest = (): string =>
    [
        '## Available on request (ask and the detail will be provided)',
        `Projects: ${PROJECTS.map((p) => p.title).join(', ')}`,
        `Roles: ${EXPERIENCE.map((e) => `${e.role} at ${e.company} (${e.period})`).join('; ')}`,
    ].join('\n');

/**
 * The grounding context for one question.
 *
 * Sending the whole corpus every turn costs ~6,000 prompt tokens per message,
 * which exhausts Groq's free-tier 8K tokens-per-minute budget after two
 * questions and comes back to the visitor as "I'm being rate limited
 * upstream". Cheap sections always go; the expensive ones go when the question
 * is about them.
 */
export const selectProfileContext = (query: string): string => {
    const parts: string[] = [];
    let includedHeavy = false;

    for (const section of SECTIONS) {
        if (section.always || section.cues?.test(query)) {
            parts.push(`${section.heading}\n${section.body}`);
            if (!section.always) includedHeavy = true;
        }
    }

    if (!includedHeavy) parts.push(buildDigest());

    return parts.join('\n\n');
};

/**
 * The full grounding corpus, every section included. Computed once per server
 * instance — `data.ts` and `profile.ts` are static imports, so there is
 * nothing to invalidate. Prefer `selectProfileContext` for per-request
 * grounding; this is the whole-corpus view, kept for tooling and size checks.
 */
export const PROFILE_BASE: string = buildFacts();

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
