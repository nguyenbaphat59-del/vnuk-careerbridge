import crypto from 'node:crypto';

const ROLE_SKILLS = [
  {
    match: /front.?end|web developer|ui developer|react/i,
    skills: [
      ['HTML & CSS', 'Build semantic pages, use Flexbox/Grid, and make layouts responsive.'],
      ['JavaScript', 'Practice variables, functions, arrays, objects, and DOM interactions.'],
      ['Git & GitHub', 'Create a repository, commit small changes, and write a useful README.'],
      ['Responsive UI', 'Rebuild a reference screen and test it on mobile, tablet, and desktop.'],
      ['Portfolio project', 'Ship one small, polished project that demonstrates your fundamentals.'],
      ['Technical English', 'Read documentation and explain one technical concept in English.'],
      ['Interview practice', 'Practise explaining your decisions and solving a beginner coding task.']
    ]
  },
  {
    match: /back.?end|software engineer|software developer|full.?stack|java developer/i,
    skills: [
      ['Programming fundamentals', 'Practise problem solving, functions, arrays, objects, and error handling.'],
      ['REST APIs', 'Design and test endpoints with clear request and response formats.'],
      ['Databases & SQL', 'Model a small database and practise SELECT, JOIN, INSERT, and UPDATE.'],
      ['Git & GitHub', 'Use branches, meaningful commits, and a clean project README.'],
      ['Testing & debugging', 'Write test cases and trace errors systematically.'],
      ['Portfolio project', 'Build and document a small end-to-end application.'],
      ['Technical English', 'Read documentation and explain an implementation in English.'],
      ['Interview practice', 'Review core concepts and practise explaining your code.']
    ]
  },
  {
    match: /data analyst|data science|business analyst|analytics/i,
    skills: [
      ['Excel / spreadsheets', 'Clean a dataset and use formulas, sorting, and pivot tables.'],
      ['SQL', 'Practise filtering, grouping, joins, and basic aggregations.'],
      ['Python for data', 'Load and explore a dataset with pandas.'],
      ['Data visualisation', 'Build a concise chart or dashboard and explain the insight.'],
      ['Portfolio case study', 'Write a short case study that connects data to a decision.'],
      ['Technical English', 'Summarise a chart and explain findings in English.'],
      ['Interview practice', 'Practise business questions and explaining your analytical process.']
    ]
  },
  {
    match: /design|ui.?ux|product designer/i,
    skills: [
      ['Design fundamentals', 'Practise hierarchy, spacing, alignment, and typography.'],
      ['Figma workflow', 'Create a small component set and reusable styles.'],
      ['User research', 'Write interview questions and summarise user needs.'],
      ['Prototyping', 'Build a clickable flow and test it with another person.'],
      ['Portfolio case study', 'Explain the problem, constraints, iterations, and outcome.'],
      ['Presentation skills', 'Walk through one design decision clearly.'],
      ['Interview practice', 'Practise discussing trade-offs and feedback.']
    ]
  }
];

const GENERAL_SKILLS = [
  ['Role fundamentals', 'Review the core concepts most often used in your target role.'],
  ['Practical project', 'Create a small piece of work that proves one relevant skill.'],
  ['Communication', 'Explain your process and ask clear questions when you get stuck.'],
  ['Technical English', 'Read a short role-related resource and note key vocabulary.'],
  ['CV & portfolio', 'Turn one experience or project into a clear, evidence-based bullet.'],
  ['Interview practice', 'Practise a common question and refine your answer.']
];

// Date keys must be built from local calendar parts, not toISOString(), which
// can shift a local midnight to the previous day in UTC+ time zones.
export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TASK_VARIANTS = {
  'HTML & CSS': ['Review semantic HTML and build a page skeleton', 'Practise Flexbox with a card layout', 'Recreate a small responsive section', 'Polish spacing, colour, and typography', 'Check accessibility and mobile behaviour'],
  JavaScript: ['Practise variables, functions, and conditions', 'Solve three array or string exercises', 'Build a small DOM interaction', 'Refactor repeated code into functions', 'Explain one JavaScript concept in your own words'],
  'Git & GitHub': ['Create a clean repository and first commit', 'Practise branching and merging', 'Write a project README', 'Review commit messages and repository structure'],
  'Responsive UI': ['Test a layout at mobile width', 'Build a responsive navigation pattern', 'Fix overflow and spacing issues', 'Compare the page on tablet and desktop'],
  'Technical English': ['Read a short technical article', 'Learn and use five role-related terms', 'Explain a concept aloud in English', 'Write a short summary of what you learned'],
  'Interview practice': ['Answer “Tell me about yourself”', 'Practise one role-related question', 'Explain a project and its trade-offs', 'Review a common behavioural question'],
  'Portfolio project': ['Define a small project’s scope', 'Build one core feature', 'Improve one detail and test it', 'Write a short project case study'],
  'Programming fundamentals': ['Solve two small logic exercises', 'Practise functions and edge cases', 'Refactor a previous solution', 'Explain your solution step by step'],
  'REST APIs': ['Sketch an endpoint and its response', 'Test success and error responses', 'Add input validation to a route', 'Document an API example'],
  'Databases & SQL': ['Practise SELECT, WHERE, and ORDER BY', 'Write a GROUP BY query', 'Practise a JOIN with two tables', 'Design a simple relational schema'],
  'Testing & debugging': ['Reproduce a bug and note the steps', 'Write test cases for a function', 'Trace an error using logs', 'Fix an edge case and verify it'],
  'Excel / spreadsheets': ['Clean a small sample dataset', 'Practise lookup and conditional formulas', 'Create a pivot table', 'Summarise three useful data points'],
  SQL: ['Practise filtering and sorting data', 'Write an aggregate query', 'Join two related tables', 'Explain a query result in plain language'],
  'Python for data': ['Load a CSV into pandas', 'Inspect missing values and types', 'Group data and calculate a metric', 'Write a short notebook summary'],
  'Data visualisation': ['Choose the right chart for one question', 'Create a chart with clear labels', 'Write a one-sentence insight', 'Simplify a cluttered visual'],
  'Design fundamentals': ['Review spacing and visual hierarchy', 'Create a simple type scale', 'Compare two layout alternatives', 'Audit a screen for consistency'],
  'Figma workflow': ['Create reusable colour and text styles', 'Build three reusable components', 'Practise auto layout', 'Organise a small design file'],
  'User research': ['Write five open-ended questions', 'Map a user journey', 'Summarise pain points into themes', 'Turn one insight into a design opportunity'],
  Prototyping: ['Create a simple clickable flow', 'Add a meaningful interaction state', 'Test the flow with a peer', 'Note one improvement from feedback'],
  'Role fundamentals': ['Read a beginner-friendly role overview', 'List the key concepts in a job post', 'Practise one foundational exercise', 'Summarise what you learned'],
  'Practical project': ['Choose a small real-world problem', 'Make a first working version', 'Get feedback and improve one detail', 'Document the outcome'],
  Communication: ['Write a clear progress update', 'Practise asking a specific technical question', 'Explain a task in three simple steps', 'Reflect on one communication improvement'],
  'CV & portfolio': ['Review one CV bullet for clear evidence', 'Collect project links and outcomes', 'Tailor a short profile summary', 'Improve the structure of a portfolio page'],
  'Portfolio case study': ['Define the case-study problem', 'Show the approach and key decisions', 'Add a result or lesson learned', 'Edit the story for clarity'],
  'Presentation skills': ['Explain one decision in under two minutes', 'Practise a concise project walkthrough', 'Record and review a short explanation', 'Prepare an answer to a follow-up question']
};

function selectedSkills(profile) {
  const role = `${profile.targetRole || ''} ${profile.major || ''}`;
  const matched = ROLE_SKILLS.find((item) => item.match.test(role));
  return matched?.skills || GENERAL_SKILLS;
}

export function analyseProfile(profile) {
  const requirements = selectedSkills(profile);
  const existingText = [profile.currentSkills, profile.interests, profile.careerGoal].join(' ').toLowerCase();
  const knownAliases = {
    'HTML & CSS': ['html', 'css'],
    JavaScript: ['javascript', 'js'],
    'Git & GitHub': ['git', 'github'],
    'Responsive UI': ['responsive', 'responsive design'],
    'Technical English': ['english', 'ielts', 'toeic'],
    'Portfolio project': ['portfolio', 'project'],
    'Programming fundamentals': ['programming', 'java', 'python', 'c++', 'javascript'],
    'Databases & SQL': ['sql', 'database', 'mysql', 'postgres'],
    'REST APIs': ['api', 'rest'],
    'Excel / spreadsheets': ['excel', 'spreadsheet'],
    'Data visualisation': ['visualization', 'visualisation', 'tableau', 'power bi'],
    'Design fundamentals': ['design', 'typography', 'layout'],
    'Figma workflow': ['figma'],
    'User research': ['research', 'user interview'],
    Prototyping: ['prototype', 'prototyping']
  };
  const strong = requirements.filter(([skill]) => {
    const aliases = knownAliases[skill] || [skill.toLowerCase()];
    return aliases.some((alias) => existingText.includes(alias));
  }).map(([skill]) => skill);
  const gaps = requirements.filter(([skill]) => !strong.includes(skill)).map(([skill, description], index) => ({
    skill,
    description,
    priority: index < 2 ? 'High' : index < 5 ? 'Medium' : 'Next step'
  }));
  const jdText = (profile.jobDescription || '').trim();
  const jdKeywords = [...new Set((jdText.match(/\b(html|css|javascript|react|node|sql|python|java|git|figma|excel|communication|english|api|testing|portfolio|design|data|agile)\b/gi) || []).map((word) => word.toLowerCase()))].slice(0, 8);
  const strengths = strong.length
    ? strong.slice(0, 4).map((skill) => `Your profile already mentions ${skill}, so you can build on that foundation.`)
    : [
        `You have a starting direction${profile.targetRole ? ` toward ${profile.targetRole}` : profile.major ? ` in ${profile.major}` : ''}; the plan will turn it into practical next steps.`,
        profile.interests?.trim() ? `Your interests (${profile.interests.trim().slice(0, 90)}) can help keep practice relevant.` : 'You are willing to map your current level before choosing what to learn next.'
      ];
  const weaknesses = gaps.slice(0, 3).map((gap) => `${gap.skill} needs more visible evidence through practice or a small project.`);
  if (jdText && jdKeywords.length) weaknesses.unshift(`The job description mentions ${jdKeywords.slice(0, 4).join(', ')}; compare these with your current evidence.`);
  return {
    headline: gaps.length ? `${gaps.length} areas to prioritise before applying` : 'Build proof of your skills and keep practising',
    summary: `This demo analysis compares your profile${jdText ? ' and the job description' : ''} with common expectations for ${profile.targetRole || profile.major || 'an entry-level role'}. It is a starting point, not a hiring prediction.`,
    strengths,
    weaknesses: weaknesses.slice(0, 4),
    gaps,
    jdKeywords,
    generatedAt: new Date().toISOString(),
    mode: 'demo'
  };
}

export function generateTasks(profile, gaps) {
  const months = Math.max(1, Math.min(6, Number(profile.timelineMonths) || 1));
  let totalDays = months * 30;
  const skills = (gaps.length ? gaps.map((gap) => gap.skill) : selectedSkills(profile).map(([skill]) => skill));
  const tasks = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  if (profile.targetHireDate) {
    const targetDate = new Date(`${profile.targetHireDate}T00:00:00`);
    if (!Number.isNaN(targetDate.getTime()) && targetDate > startDate) {
      const daysUntilTarget = Math.ceil((targetDate - startDate) / 86400000) + 1;
      totalDays = Math.max(1, Math.min(totalDays, daysUntilTarget));
    }
  }
  for (let day = 1; day <= totalDays; day += 1) {
    const skill = skills[(day - 1) % skills.length];
    const variants = TASK_VARIANTS[skill] || [`Practise one focused ${skill} concept`, `Apply ${skill} in a short exercise`, `Review and improve your ${skill} work`];
    const variant = variants[Math.floor((day - 1) / Math.max(1, skills.length)) % variants.length] || variants[(day - 1) % variants.length];
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + day - 1);
    const minutes = Math.max(10, Math.min(90, Math.round((Number(profile.dailyMinutes) || 45) * 0.65)));
    tasks.push({
      id: crypto.randomUUID(),
      dayNumber: day,
      weekNumber: Math.ceil(day / 7),
      monthNumber: Math.ceil(day / 30),
      dueDate: localDateKey(dueDate),
      title: variant,
      skill,
      description: (gaps.find((gap) => gap.skill === skill)?.description) || `Spend a focused session building confidence in ${skill}.`,
      durationMins: minutes,
      status: 'todo',
      startedAt: null,
      completedAt: null
    });
  }
  return tasks;
}

export function buildPlan(profile) {
  const analysis = analyseProfile(profile);
  const tasks = generateTasks(profile, analysis.gaps);
  return { analysis, tasks };
}
