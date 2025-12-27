/**
 * Assistant Knowledge Base
 * Comprehensive, rephrased information about Hakkan's portfolio
 * This file provides the bot with detailed, natural-sounding responses
 * NOT copied word-for-word from the original data
 */

// ============ ABOUT HAKKAN ============

export const ABOUT_KNOWLEDGE = {
    // Short intro for quick responses
    quickIntro: "Hakkan Parbej Shah is a passionate full-stack developer and B Tech Computer Science student who loves building web applications that make a real difference.",

    // Detailed about with personality
    detailedAbout: `Hakkan is a driven full-stack developer currently pursuing his B.Tech in Computer Science. What sets him apart is his unique blend of creativity and technical skills – he doesn't just write code, he crafts digital experiences.

His expertise spans the entire web development stack:
• Frontend mastery with React, Next js, and TypeScript
• Backend proficiency using Node js and Express
• AI integration experience with Gemini, OpenAI, and other cutting-edge APIs
• Database knowledge covering MongoDB, PostgreSQL, MySQL, and more

Beyond coding, Hakkan is a natural problem-solver and team player who thrives under pressure and consistently delivers quality work on deadline.`,

    // Different personality-based versions
    versions: {
        professional: "Hakkan Parbej Shah is an innovative B.Tech CSE student with expertise in full-stack development, AI integration, and modern UI/UX design. He excels at leading teams and delivering high-quality solutions.",
        casual: "Hakkan's a full-stack dev who loves building cool web apps! He's studying Computer Science and has already worked on some pretty impressive projects using React, Next.js, and AI tools.",
        enthusiastic: "Meet Hakkan – a passionate developer who's all about creating impactful web experiences! From AI-powered apps to sleek user interfaces, he brings creativity and technical excellence to everything he builds.",
    },

    // Key traits for the bot to mention
    keyTraits: [
        "Full-stack developer with frontend and backend expertise",
        "Currently pursuing B.Tech in Computer Science",
        "Experienced with AI integration (Gemini, OpenAI)",
        "Strong problem-solving and leadership skills",
        "Passionate about building impactful applications",
    ],
};

// ============ PROJECTS KNOWLEDGE ============

export interface ProjectKnowledge {
    name: string;
    aliases: string[];  // Alternative names users might use
    shortDescription: string;
    detailedDescription: string;
    whyBuilt: string;
    techHighlights: string;
    coolFact: string;
    liveUrl: string;
    category: string;
}

export const PROJECTS_KNOWLEDGE: ProjectKnowledge[] = [
    {
        name: "MockHick",
        aliases: ["mockhick", "mock hick", "interview app", "ai interview", "maukhik"],
        shortDescription: "An AI-powered mock interview platform that helps users practice and ace their job interviews.",
        detailedDescription: `MockHick is Hakkan's flagship project – an innovative platform that simulates realistic job interviews using AI. The name comes from the Hindi word "Maukhik" (मौखिक) meaning oral or spoken.

Here's what makes it special:
• **AI-Powered Questions**: Uses Gemini AI to generate dynamic, role-specific interview questions
• **Voice Interaction**: Real-time speech recognition lets you practice speaking naturally
• **Instant Feedback**: Get detailed, personalized feedback on your performance
• **Confidence Builder**: Perfect for students and job seekers who want to practice without needing another person`,
        whyBuilt: "Hakkan noticed that many students and job seekers struggle with interview anxiety because they don't have access to proper practice opportunities. MockHick solves this by providing an AI interviewer available 24/7 – no scheduling conflicts, no awkwardness, just pure practice.",
        techHighlights: "Built with Next.js and TypeScript for the frontend, Firebase for authentication and database, Web Speech API for voice interaction, and Gemini AI for intelligent question generation.",
        coolFact: "The speech recognition works so well that users often forget they're talking to an AI!",
        liveUrl: "https://mockhick.vercel.app/",
        category: "AI Application",
    },
    {
        name: "BuildMyCV",
        aliases: ["buildmycv", "build my cv", "resume builder", "cv maker", "cvbanao"],
        shortDescription: "An AI-powered resume builder that helps create professional CVs quickly and efficiently.",
        detailedDescription: `BuildMyCV takes the pain out of resume writing. Instead of staring at a blank document, users get AI assistance to craft compelling, professional resumes in minutes.

Key features include:
• **AI-Powered Suggestions**: Get recommendations for powerful action verbs and impactful phrases
• **Smart Formatting**: Automatic professional formatting that looks great
• **Job-Specific Tailoring**: Customize your resume for specific job descriptions
• **PDF Export**: Download polished resumes ready for submission`,
        whyBuilt: "Creating a good resume is tedious and time-consuming. Hakkan built this tool to empower job seekers to present their skills effectively without spending hours on formatting and wording.",
        techHighlights: "Developed using React, Next.js, TypeScript, and Genkit for AI features, with professional PDF generation capabilities.",
        coolFact: "Users have reported creating their first draft in under 10 minutes!",
        liveUrl: "https://cvbanao.netlify.app/",
        category: "Productivity Tool",
    },
    {
        name: "VerifyAI",
        aliases: ["verifyai", "verify ai", "fake news detector", "deepfake detector", "misinformation"],
        shortDescription: "A powerful tool that detects fake news, deepfakes, and AI-generated content.",
        detailedDescription: `VerifyAI is Hakkan's response to the growing misinformation problem online. In an age where AI can create convincing fake content, this tool helps users separate fact from fiction.

What it can analyze:
• **Text Content**: Detects signs of AI-generated or manipulated text
• **Images**: Identifies edited or artificially created images
• **Videos**: Spots potential deepfake videos
• **Trust Scores**: Provides confidence ratings for content authenticity`,
        whyBuilt: "With AI-generated content becoming increasingly realistic, Hakkan saw the urgent need for a tool that helps everyday users verify what they see online. It's about fighting misinformation with technology.",
        techHighlights: "Combines JavaScript and Python, uses Next.js for the frontend, integrates Gemini API for analysis, and leverages TensorFlow for machine learning capabilities.",
        coolFact: "This project was inspired by seeing how easily misinformation spreads on social media.",
        liveUrl: "https://verifyai.is-a.software/",
        category: "AI Tool",
    },
    {
        name: "ConfessCode",
        aliases: ["confesscode", "confess code", "anonymous", "confession platform", "secrets"],
        shortDescription: "A secure anonymous confession platform where users can share thoughts without revealing identity.",
        detailedDescription: `ConfessCode provides a safe space for anonymous expression online. It's built with privacy as the top priority.

Security features include:
• **Complete Anonymity**: No way to trace messages back to senders
• **Robust Authentication**: Secure login system
• **Encrypted Messages**: All confessions are protected
• **Clean Interface**: Easy to use without compromising privacy`,
        whyBuilt: "Hakkan wanted to create a space where people can express themselves freely without fear of judgment. In today's digital world, having a truly anonymous outlet is increasingly valuable.",
        techHighlights: "Built with Next.js and TypeScript for type-safe development, Supabase for secure backend, and Tailwind CSS with ShadCN for the UI.",
        coolFact: "The auth system was designed to be so secure that even the admin can't trace who posted what!",
        liveUrl: "https://concode.vercel.app/",
        category: "Social Platform",
    },
    {
        name: "MemeMate",
        aliases: ["mememate", "meme mate", "meme dating", "dating app", "humor match"],
        shortDescription: "A unique dating app concept that matches people based on their sense of humor through memes.",
        detailedDescription: `MemeMate is a fun prototype that reimagines dating apps. Instead of swiping on photos, users connect through shared humor!

The concept:
• **Meme-Based Matching**: Share and react to memes – if you laugh at the same things, you might be a match!
• **Humor Profiles**: Build a profile around your comedy preferences
• **Fun First**: Takes the pressure off traditional dating by focusing on fun
• **Social Features**: Comment and interact around shared meme interests`,
        whyBuilt: "This was a creative exploration project where Hakkan practiced UI/UX design while prototyping a unique app idea. It combines social media elements with dating app mechanics in a novel way.",
        techHighlights: "Created with React, Next.js, TypeScript, and Tailwind CSS for a responsive, modern interface.",
        coolFact: "The matching algorithm could theoretically predict compatibility based on meme preferences!",
        liveUrl: "https://mememate.netlify.app/",
        category: "Prototype",
    },
    {
        name: "AluChat",
        aliases: ["aluchat", "alu chat", "chatbot", "dual personality", "savage bot"],
        shortDescription: "An AI chatbot with switchable personalities – from sweet and helpful to witty and savage.",
        detailedDescription: `AluChat is not your average chatbot – it has personality! Users can toggle between two distinct modes:

• **Sweet Mode**: Friendly, helpful, and supportive – like having a patient assistant
• **Savage Mode**: Witty, sarcastic, and entertaining – for when you want some fun

It showcases what's possible with modern language models and creative prompt engineering.`,
        whyBuilt: "Hakkan wanted to push beyond boring customer service bots and create something more engaging and entertaining. It was also a great experiment in prompt engineering.",
        techHighlights: "Built with JavaScript, Next.js, Tailwind CSS, and integrates the Gemini API for AI responses.",
        coolFact: "The savage mode responses are so good that users often come back just for entertainment!",
        liveUrl: "https://aluchat.netlify.app/",
        category: "AI Chatbot",
    },
    {
        name: "ReelXtract",
        aliases: ["reelxtract", "reel xtract", "reels downloader", "instagram downloader", "reel download"],
        shortDescription: "A simple, fast tool to download Instagram Reels with one click.",
        detailedDescription: `ReelXtract solves a common problem – downloading Instagram Reels easily.

How it works:
• **Paste the URL**: Just copy the Reel link
• **Click Download**: One button does all the work
• **Save the Video**: Get your video file instantly

The Instagram-themed UI makes it feel familiar and easy to use.`,
        whyBuilt: "Sometimes you just want to save a Reel for offline viewing or sharing. Hakkan built this tool to make that process as simple as possible.",
        techHighlights: "Frontend built with JavaScript, backend uses Python with Flask, and yt-dlp handles the actual downloading.",
        coolFact: "Despite being a simple app, it handles all the complex backend work seamlessly!",
        liveUrl: "https://hakkanshah.github.io/ReelXtract/",
        category: "Utility Tool",
    },
    {
        name: "Math-O-Matic",
        aliases: ["mathomatic", "math o matic", "calculator", "scientific calculator", "unit converter"],
        shortDescription: "A multipurpose scientific calculator with unit conversion capabilities.",
        detailedDescription: `Math-O-Matic is a comprehensive calculator that goes beyond basic arithmetic:

• **Scientific Functions**: All the advanced math operations you need
• **Unit Conversion**: Convert between different measurement units
• **Clean Interface**: Simple, intuitive design

It's proof that even utility apps can be well-designed.`,
        whyBuilt: "This project was Hakkan's way of testing and improving his JavaScript logic skills. Building a calculator seems simple but requires solid programming fundamentals.",
        techHighlights: "Pure HTML, CSS, and JavaScript – proving that great apps don't always need frameworks.",
        coolFact: "This was one of Hakkan's earlier projects that helped solidify his programming foundations!",
        liveUrl: "https://hakkanshah.github.io/Math-o-Matic/",
        category: "Utility Tool",
    },
    {
        name: "Hit-The-Jhatu",
        aliases: ["hit the jhatu", "jhatu game", "whack a mole", "browser game", "meme game"],
        shortDescription: "A fun whack-a-mole style browser game featuring desi meme characters.",
        detailedDescription: `Hit-The-Jhatu is a hilarious browser game inspired by Indian meme culture!

Gameplay:
• **Hit the Jhatu**: Score points by clicking on Jhatu characters
• **Avoid the Gandu**: Don't click on the wrong ones!
• **Challenge Friends**: Try to beat each other's high scores
• **Reflexes Test**: How fast can you click?

It's a prank game featuring Hakkan's friends as characters – made entirely for fun!`,
        whyBuilt: "This was a fun experimental project to test logical reasoning and game development skills. Plus, it's a great way to prank friends!",
        techHighlights: "Built with Node.js, HTML, CSS, and JavaScript for browser-based gaming.",
        coolFact: "The characters are based on Hakkan's actual friends – they weren't too happy about being 'jhatus'! 😄",
        liveUrl: "https://hakkanshah.github.io/Hit-The-Jhatu/",
        category: "Fun/Game",
    },
];

// ============ SKILLS KNOWLEDGE ============

export const SKILLS_KNOWLEDGE = {
    overview: `Hakkan has built a versatile skill set covering the full spectrum of modern web development. Here's a breakdown of his technical capabilities:`,

    categories: {
        frontend: {
            summary: "On the frontend, Hakkan creates responsive, interactive user interfaces that look great and perform even better.",
            skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React.js", "Next.js"],
            highlight: "React and Next.js are his go-to tools for building production-ready applications.",
        },
        backend: {
            summary: "For backend development, Hakkan builds robust APIs and server-side logic that power modern applications.",
            skills: ["Node.js", "Next.js", "Express.js", "Flask"],
            highlight: "He's particularly experienced with the Node.js ecosystem and has also worked with Python's Flask.",
        },
        database: {
            summary: "Hakkan has experience with various database systems, from SQL to NoSQL solutions.",
            skills: ["MongoDB", "MySQL", "PostgreSQL", "Supabase", "Redis", "Firestore"],
            highlight: "MongoDB and Supabase are frequently used in his projects for flexible data storage.",
        },
        uiux: {
            summary: "Beyond code, Hakkan pays attention to design and user experience using modern UI libraries.",
            skills: ["Tailwind CSS", "Framer Motion", "shadcn/ui"],
            highlight: "Tailwind CSS with shadcn/ui creates the clean, modern look you see in his projects.",
        },
        tools: {
            summary: "Hakkan uses a modern development toolkit to stay productive and deliver quality code.",
            skills: ["Git", "GitHub", "VS Code", "Firebase", "Vercel", "Netlify", "Cursor", "Antigravity"],
            highlight: "He deploys most projects on Vercel or Netlify for seamless CI/CD.",
        },
        aiTools: {
            summary: "Hakkan leverages AI tools to enhance productivity and integrate intelligent features into applications.",
            skills: ["ChatGPT", "Claude", "Gemini"],
            highlight: "He's integrated Gemini AI into multiple projects including MockHick and VerifyAI.",
        },
        programming: {
            summary: "Beyond JavaScript/TypeScript, Hakkan has programming experience in multiple languages.",
            skills: ["Java", "C", "Python"],
            highlight: "Python is used for backend scripts and ML integrations.",
        },
        softSkills: {
            summary: "Technical skills are just part of the picture – Hakkan also brings strong interpersonal abilities.",
            skills: ["Problem Solving", "Teamwork", "Communication"],
            highlight: "His leadership and communication skills shine through in team projects.",
        },
    },

    // Quick summary for voice responses
    quickSummary: "Hakkan's tech stack includes React and Next.js for frontend, Node.js for backend, MongoDB and PostgreSQL for databases, and experience integrating AI tools like Gemini. He's also got strong soft skills in problem-solving and teamwork.",
};

// ============ EXPERIENCE KNOWLEDGE ============

export const EXPERIENCE_KNOWLEDGE = {
    overview: "Hakkan has gained real-world experience through internships at tech companies, working on production applications and shipping real features.",

    positions: [
        {
            role: "Full Stack Developer Intern",
            company: "UDRCRAFTS INDIA PVT. LTD.",
            status: "Current",
            period: "Present",
            summary: "Currently working as a Full Stack Developer at UDRCRAFTS, building both frontend interfaces and backend systems for e-commerce solutions.",
            achievements: [
                "Built a complete e-commerce platform from the ground up",
                "Developed responsive homepage components with modern design",
                "Created product listings with advanced search, filtering, and sorting",
                "Built backend APIs for products, pricing, and inventory management",
                "Integrated secure payment gateway for transactions",
                "Managed database operations and optimized query performance",
            ],
            techUsed: ["React", "Node.js", "Express", "MongoDB", "Payment Gateway APIs", "RESTful APIs"],
            funFact: "Hakkan jokes that 50% of backend work was actual code and 50% was console.log debugging!",
        },
        {
            role: "React and Next.js Developer Intern",
            company: "AIKing Solutions",
            status: "Previous",
            period: "Previous",
            summary: "Worked on an AI-powered mock interview platform, focusing on voice interaction and real-time AI feedback systems.",
            achievements: [
                "Built AI interviewer and user communication system",
                "Developed dynamic question generation algorithms",
                "Enhanced AI voice to sound more natural and human-like",
                "Implemented live voice transcription using Google TTS",
                "Fixed critical UI/UX bugs to improve user experience",
                "Created one-click video download feature for interview recordings",
            ],
            techUsed: ["React", "Next.js", "Google TTS", "WaveNet", "WebRTC", "AI Integration"],
            funFact: "The team spent days tweaking the AI voice so it wouldn't sound like a 'haunted GPS'!",
        },
    ],

    quickSummary: "Hakkan has interned at two companies – currently at UDRCRAFTS as a Full Stack Developer building e-commerce solutions, and previously at AIKing Solutions where he worked on an AI interview platform.",
};

// ============ EDUCATION KNOWLEDGE ============

export const EDUCATION_KNOWLEDGE = {
    overview: "Hakkan is pursuing his Bachelor's in Computer Science while also having a strong academic foundation from his earlier education.",

    degrees: [
        {
            level: "Bachelor's Degree",
            degree: "B.Tech in Computer Science and Engineering",
            institution: "Greater Kolkata College of Engineering and Management",
            period: "2022 – 2026 (Expected)",
            performance: "CGPA: 7.5/10",
            description: "Currently in the final years of engineering, focusing on practical skills alongside academic coursework. Hakkan actively works on personal projects and internships to supplement classroom learning.",
        },
        {
            level: "Higher Secondary",
            degree: "Higher Secondary (12th Standard)",
            institution: "West Bengal Council of Higher Secondary Education (WBCHSE)",
            period: "2022",
            performance: "Percentage: 85%",
            description: "Completed higher secondary education with strong academic performance, building the foundation for engineering studies.",
        },
        {
            level: "Secondary",
            degree: "Secondary (10th Standard)",
            institution: "West Bengal Board of Secondary Education (WBBSE)",
            period: "2020",
            performance: "Percentage: 80%",
            description: "Solid secondary education laying the groundwork for science and technology focus.",
        },
    ],

    quickSummary: "Hakkan is a B.Tech CSE student at Greater Kolkata College of Engineering with a 7.5 CGPA. He scored 85% in his 12th and 80% in his 10th boards.",
};

// ============ CERTIFICATIONS KNOWLEDGE ============

export const CERTIFICATIONS_KNOWLEDGE = {
    overview: "Hakkan has earned several industry certifications and completed virtual internships to expand his knowledge beyond the classroom.",

    certifications: [
        {
            name: "Full-Stack (MERN) BCT Training",
            issuer: "Euphoria GenX",
            description: "Comprehensive training in the MERN stack (MongoDB, Express, React, Node.js) covering full-stack web development.",
            relevance: "This certification validates Hakkan's core web development skills.",
        },
        {
            name: "AWS AI-ML Virtual Internship",
            issuer: "Eduskills Foundation & AWS",
            description: "Virtual internship program covering AI and Machine Learning concepts on AWS cloud platform.",
            relevance: "Shows Hakkan's interest in cloud computing and AI/ML technologies.",
        },
        {
            name: "Palo Alto Cybersecurity",
            issuer: "Eduskills Foundation & Palo Alto",
            description: "Certification in cybersecurity fundamentals from a leading security company.",
            relevance: "Demonstrates awareness of security principles important for any developer.",
        },
        {
            name: "Blue Prism Automation",
            issuer: "Eduskills Foundation & Blue Prism",
            description: "Training in robotic process automation (RPA) using Blue Prism tools.",
            relevance: "Experience with automation technologies beyond standard development.",
        },
        {
            name: "Zscaler Zero Trust Security",
            issuer: "Eduskills Foundation & Zscaler",
            description: "Certification in zero trust security architecture and principles.",
            relevance: "Modern approach to security that's increasingly important in enterprise environments.",
        },
    ],

    quickSummary: "Hakkan holds certifications in MERN full-stack development, AWS AI/ML, Palo Alto Cybersecurity, Blue Prism Automation, and Zscaler Zero Trust Security.",
};

// ============ CONTACT KNOWLEDGE ============

export const CONTACT_KNOWLEDGE = {
    overview: "Hakkan is always open to connecting with fellow developers, potential collaborators, or anyone interested in his work!",

    channels: {
        email: {
            value: "hakkanparbej@gmail.com",
            description: "Best for professional inquiries, job opportunities, or project discussions.",
            action: "Send an email to hakkanparbej@gmail.com",
        },
        phone: {
            value: "+91-7810843038",
            description: "Available for calls – please text first if possible!",
            action: "Call or text +91-7810843038",
        },
        github: {
            username: "HakkanShah",
            url: "https://github.com/HakkanShah",
            description: "Check out all of Hakkan's code and projects here.",
            action: "Visit github.com/HakkanShah to see the repositories",
        },
        linkedin: {
            username: "hakkan",
            url: "https://www.linkedin.com/in/hakkan/",
            description: "Connect professionally and see work updates.",
            action: "Connect on LinkedIn at linkedin.com/in/hakkan",
        },
        googleDev: {
            username: "hakkan",
            url: "https://g.dev/hakkan",
            description: "Hakkan's Google Developer profile.",
            action: "Check out the Google Developer profile",
        },
    },

    quickSummary: "You can reach Hakkan via email at hakkanparbej@gmail.com, on GitHub as HakkanShah, or connect on LinkedIn. He's always happy to hear from fellow developers!",

    cta: "Don't hesitate to reach out – Hakkan loves connecting with people who share his passion for technology!",
};

// ============ HELPER FUNCTIONS ============

/**
 * Find a project by name or alias
 */
export const findProject = (query: string): ProjectKnowledge | null => {
    const normalized = query.toLowerCase().trim();

    for (const project of PROJECTS_KNOWLEDGE) {
        if (
            project.name.toLowerCase() === normalized ||
            project.aliases.some((alias) => alias.includes(normalized) || normalized.includes(alias))
        ) {
            return project;
        }
    }

    return null;
};

/**
 * Get projects by category
 */
export const getProjectsByCategory = (category: string): ProjectKnowledge[] => {
    return PROJECTS_KNOWLEDGE.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase())
    );
};

/**
 * Get a random variation of about text
 */
export const getRandomAboutVersion = (): string => {
    const versions = Object.values(ABOUT_KNOWLEDGE.versions);
    return versions[Math.floor(Math.random() * versions.length)];
};

/**
 * Get skill category information
 */
export const getSkillCategory = (categoryName: string) => {
    const key = categoryName.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof SKILLS_KNOWLEDGE.categories;
    return SKILLS_KNOWLEDGE.categories[key] || null;
};
