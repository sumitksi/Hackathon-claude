const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function chat(system, userContent) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userContent }],
  });
  return response.content[0].text;
}

function parseJSON(text) {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(stripped);
}

router.post('/search', async (req, res) => {
  const { query } = req.body;
  const candidates = await prisma.candidate.findMany({
    include: { applications: { include: { job: true } } },
  });

  const candidateList = candidates.map(c => ({
    id: c.id, name: c.name, skills: c.skills, currentRole: c.currentRole,
    experience: c.experience, location: c.location, source: c.source,
  }));

  try {
    const response = await chat(
      `You are a recruitment search assistant. The user query may contain spelling mistakes or typos — understand the intent anyway. Match candidates from the JSON list that best fit the query. Consider role/title similarity, skills, experience level, location, and source. Respond ONLY with a raw JSON array of matching candidate IDs. No markdown, no explanation. Example: ["id1","id2"]`,
      `Query: "${query}"\n\nCandidates: ${JSON.stringify(candidateList)}`
    );

    let ids = [];
    try {
      const parsed = parseJSON(response);
      ids = Array.isArray(parsed) ? parsed.map(c => (typeof c === 'object' ? c.id : c)) : [];
    } catch {
      ids = [...response.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi)].map(m => m[0]);
    }

    const results = candidates.filter(c => ids.includes(c.id));
    if (results.length === 0) {
      const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      return res.json({ results: candidates.filter(c => words.some(w => c.name.toLowerCase().includes(w) || (c.currentRole || '').toLowerCase().includes(w) || c.skills.some(s => s.toLowerCase().includes(w)))), query });
    }
    res.json({ results, query });
  } catch (err) {
    console.error('AI search error:', err.message);
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    res.json({ results: candidates.filter(c => words.some(w => c.name.toLowerCase().includes(w) || (c.currentRole || '').toLowerCase().includes(w) || c.skills.some(s => s.toLowerCase().includes(w)))), query });
  }
});

router.get('/summarize/:candidateId', async (req, res) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id: req.params.candidateId },
    include: { applications: { include: { job: true, interviews: true } } },
  });
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const summary = await chat(
    'You are a recruitment assistant. Provide a concise professional summary of this candidate in 3-4 sentences. No markdown, plain text only.',
    JSON.stringify({ name: candidate.name, currentRole: candidate.currentRole, skills: candidate.skills, experience: candidate.experience, resumeText: candidate.resumeText?.slice(0, 2000) })
  );
  res.json({ summary });
});

router.post('/generate-jd', async (req, res) => {
  const { title, department, requirements } = req.body;
  const description = await chat(
    'You are an HR expert. Write a professional job description. Plain text, no markdown.',
    `Job title: ${title}, Department: ${department}, Requirements: ${requirements?.join(', ')}`
  );
  res.json({ description });
});

router.post('/rejection-suggest', async (req, res) => {
  const { candidateId, applicationId, reason } = req.body;
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId }, select: { name: true } });
  const email = await chat(
    'Write a professional, empathetic rejection email. Keep it brief, respectful, and in plain text — no markdown.',
    `Candidate: ${candidate.name}, Reason: ${reason || 'We have moved forward with other candidates'}`
  );
  res.json({ email });
});

router.get('/culture-fit/:applicationId', async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.applicationId },
    include: { candidate: true, job: true, interviews: true },
  });
  if (!application) return res.status(404).json({ error: 'Not found' });

  const analysis = await chat(
    'You are a recruitment analyst. Assess how well this candidate fits the role. Respond ONLY with a raw JSON object — no markdown, no code fences, no extra text. Format exactly: {"score": <0-100>, "strengths": ["..."], "concerns": ["..."], "overall": "2-3 sentence summary"}',
    JSON.stringify({
      candidate: { name: application.candidate.name, skills: application.candidate.skills, experience: application.candidate.experience },
      job: { title: application.job.title, department: application.job.department, requirements: application.job.requirements },
      interviews: application.interviews.map(i => ({ feedback: i.feedback, rating: i.rating })),
    })
  );
  try {
    res.json(parseJSON(analysis));
  } catch {
    res.json({ score: 70, strengths: [], concerns: [], overall: 'Unable to parse response. Please try again.' });
  }
});

router.post('/interview-questions', async (req, res) => {
  const { jobTitle, skills, type } = req.body;
  const response = await chat(
    'You are a technical interviewer. Generate exactly 6 interview questions. Respond ONLY with a raw JSON array of strings — no markdown, no code fences, no numbering. Example: ["Question one?","Question two?"]',
    `Role: ${jobTitle || 'Software Engineer'}, Skills: ${skills?.join(', ') || 'general'}, Interview type: ${type || 'technical'}`
  );
  try {
    const parsed = parseJSON(response);
    res.json({ questions: Array.isArray(parsed) ? parsed : Object.values(parsed) });
  } catch {
    const lines = response.split('\n').map(l => l.replace(/^[\d\-\.\*\s"]+|["]+$/g, '').trim()).filter(l => l.length > 10);
    res.json({ questions: lines.length > 0 ? lines : ['Unable to generate questions. Please try again.'] });
  }
});

router.get('/rejection-patterns', async (req, res) => {
  const rejected = await prisma.application.findMany({
    where: { status: 'rejected' },
    include: {
      candidate: { select: { name: true, skills: true, experience: true, currentRole: true } },
      job: { select: { title: true, department: true, requirements: true } },
      interviews: { select: { feedback: true, rating: true, type: true } },
    },
  });

  if (rejected.length === 0) return res.json({ patterns: [], total: 0 });

  const payload = rejected.map(a => ({
    candidateSkills: a.candidate.skills,
    candidateRole: a.candidate.currentRole,
    experience: a.candidate.experience,
    jobTitle: a.job.title,
    department: a.job.department,
    jobRequirements: a.job.requirements,
    interviewFeedback: a.interviews.map(i => ({ type: i.type, feedback: i.feedback, rating: i.rating })),
  }));

  const response = await chat(
    `You are a hiring analytics expert. Analyze these rejected job applications and identify rejection patterns. Look for: skill gaps vs job requirements, experience mismatches, recurring feedback themes, department-level trends. Respond ONLY with a raw JSON object, no markdown. Format exactly: {"patterns":[{"title":"short pattern title","insight":"1 sentence explaining the pattern with specific percentages or counts","affectedRole":"job title or department","stage":"which interview stage or screening","recommendation":"1 actionable fix for JD or screening criteria","severity":"high|medium|low","count":number}],"summary":"2-3 sentence overall summary of rejection health"}`,
    `Total rejected: ${rejected.length}\n\nData: ${JSON.stringify(payload)}`
  );

  try {
    res.json({ ...parseJSON(response), total: rejected.length });
  } catch {
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
});

router.get('/parse-resume/:candidateId', async (req, res) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id: req.params.candidateId },
    select: { resumeText: true },
  });
  if (!candidate?.resumeText) return res.status(400).json({ error: 'No resume text found. Upload a PDF resume first.' });

  const response = await chat(
    'You are a resume parser. Extract structured information from the resume text. Respond ONLY with a raw JSON object — no markdown, no code fences, no extra text. Use this exact format: {"name":"","email":"","phone":"","currentRole":"","experience":0,"location":"","skills":[]}. experience must be a number (years as integer). skills must be an array of strings. Use null for any field that cannot be determined.',
    candidate.resumeText.slice(0, 4000)
  );
  try {
    res.json(parseJSON(response));
  } catch {
    res.status(500).json({ error: 'Failed to parse resume structure. Try again.' });
  }
});

module.exports = router;
