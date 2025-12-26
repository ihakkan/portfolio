/**
 * Portfolio Data Service
 * Centralized data access layer for the portfolio assistant
 * Re-exports and transforms data from the main data.ts file
 */

import {
    ABOUT_ME,
    PROJECTS,
    SKILLS,
    EXPERIENCE,
    EDUCATION,
    CERTIFICATIONS,
    CONTACT_INFO,
    NAV_LINKS,
    type Project,
} from '@/lib/data';

// ============ Basic Getters ============

export const getAboutMe = (): string => ABOUT_ME;

export const getProjects = (): Project[] => PROJECTS;

export const getSkills = () => SKILLS;

export const getExperience = () => EXPERIENCE;

export const getEducation = () => EDUCATION;

export const getCertifications = () => CERTIFICATIONS;

export const getContactInfo = () => CONTACT_INFO;

export const getNavLinks = () => NAV_LINKS;

// ============ Formatted Getters for Assistant ============

export const getFormattedAbout = (): string => {
    return `Hakkan Parbej Shah is ${ABOUT_ME}`;
};

export const getFormattedProjectsList = (): string => {
    const projectNames = PROJECTS.map((p, i) => `${i + 1}. ${p.title}`).join('\n');
    return `Here are the projects:\n${projectNames}\n\nWould you like to know more about any specific project?`;
};

export const getProjectByName = (name: string): Project | undefined => {
    const normalizedName = name.toLowerCase().trim();
    return PROJECTS.find(
        (p) =>
            p.title.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(p.title.toLowerCase())
    );
};

export const getFormattedProjectDetails = (project: Project): string => {
    return `**${project.title}**: ${project.longDescription}\n\nTechnologies: ${project.tags.join(', ')}`;
};

export const getFormattedSkillsList = (): string => {
    const skillsList = SKILLS.map((category) => {
        const skillNames = category.skills.map((s) => s.name).join(', ');
        return `**${category.name}**: ${skillNames}`;
    }).join('\n\n');
    return `Here are my skills by category:\n\n${skillsList}`;
};

export const getSkillsByCategory = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase().trim();
    return SKILLS.find((c) => c.name.toLowerCase().includes(normalizedName));
};

export const getFormattedExperience = (): string => {
    const expList = EXPERIENCE.map((exp) => {
        return `**${exp.role}** at ${exp.company} (${exp.period})\n${exp.description}`;
    }).join('\n\n');
    return `Here's my professional experience:\n\n${expList}`;
};

export const getFormattedEducation = (): string => {
    const eduList = EDUCATION.map((edu) => {
        return `**${edu.degree}** from ${edu.institution} (${edu.period}) - ${edu.details}`;
    }).join('\n\n');
    return `Here's my educational background:\n\n${eduList}`;
};

export const getFormattedCertifications = (): string => {
    const certList = CERTIFICATIONS.map((cert, i) => {
        return `${i + 1}. ${cert.name} - issued by ${cert.issuer}`;
    }).join('\n');
    return `Here are my certifications:\n\n${certList}`;
};

export const getFormattedContact = (): string => {
    const contactList = CONTACT_INFO.map((info) => {
        return `**${info.name}**: ${info.value}`;
    }).join('\n');
    return `Here's how you can reach Hakkan:\n\n${contactList}`;
};

// ============ Section Navigation Helpers ============

export const getSectionId = (sectionName: string): string | null => {
    const normalizedName = sectionName.toLowerCase().trim();

    const sectionMap: Record<string, string> = {
        'home': 'home',
        'about': 'about',
        'experience': 'experience',
        'work': 'experience',
        'projects': 'projects',
        'portfolio': 'projects',
        'skills': 'skills',
        'technologies': 'skills',
        'education': 'education',
        'certifications': 'certifications',
        'certificates': 'certifications',
        'contact': 'contact',
    };

    // Direct match
    if (sectionMap[normalizedName]) {
        return sectionMap[normalizedName];
    }

    // Partial match
    for (const [key, value] of Object.entries(sectionMap)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return value;
        }
    }

    return null;
};

// ============ Search Helper ============

export const searchPortfolio = (query: string): string[] => {
    const normalizedQuery = query.toLowerCase().trim();
    const results: string[] = [];

    // Search in projects
    PROJECTS.forEach((p) => {
        if (
            p.title.toLowerCase().includes(normalizedQuery) ||
            p.description.toLowerCase().includes(normalizedQuery) ||
            p.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
        ) {
            results.push(`Project: ${p.title}`);
        }
    });

    // Search in skills
    SKILLS.forEach((category) => {
        category.skills.forEach((skill) => {
            if (skill.name.toLowerCase().includes(normalizedQuery)) {
                results.push(`Skill: ${skill.name} (${category.name})`);
            }
        });
    });

    return results;
};
