const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resumes';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}

function similarity(a, b) {
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase());
  return 1 - dist / Math.max(a.length, b.length);
}

router.get('/', async (req, res) => {
  const { search, skills, source, page = 1, limit = 20 } = req.query;
  const where = {};
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { currentRole: { contains: search, mode: 'insensitive' } }];
  if (skills) where.skills = { hasSome: skills.split(',') };
  if (source) where.source = source;

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where, skip: (page - 1) * limit, take: Number(limit),
      include: { applications: { include: { job: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.candidate.count({ where }),
  ]);
  res.json({ candidates, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get('/:id', async (req, res) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id: req.params.id },
    include: { applications: { include: { job: true, interviews: { include: { interviewer: { select: { name: true } } } }, recruiter: { select: { name: true } } } } },
  });
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

router.post('/', authorize('admin', 'recruiter'), async (req, res) => {
  const existing = await prisma.candidate.findMany({ select: { id: true, name: true, email: true } });
  const duplicates = existing.filter(c => similarity(c.name, req.body.name) > 0.85 || c.email === req.body.email);
  if (duplicates.length > 0) {
    return res.status(409).json({ error: 'Potential duplicate', duplicates });
  }
  const candidate = await prisma.candidate.create({ data: req.body });
  await req.logActivity('CREATE', 'Candidate', candidate.id, { name: candidate.name });
  res.status(201).json(candidate);
});

router.put('/:id', authorize('admin', 'recruiter'), async (req, res) => {
  const candidate = await prisma.candidate.update({ where: { id: req.params.id }, data: req.body });
  await req.logActivity('UPDATE', 'Candidate', candidate.id, { name: candidate.name });
  res.json(candidate);
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  await prisma.candidate.delete({ where: { id: req.params.id } });
  await req.logActivity('DELETE', 'Candidate', req.params.id, {});
  res.json({ message: 'Deleted' });
});

router.post('/compare', async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length < 2 || ids.length > 3) return res.status(400).json({ error: 'Provide 2-3 candidate IDs' });
  const candidates = await Promise.all(ids.map(id => prisma.candidate.findUnique({
    where: { id }, include: { applications: { include: { job: true, interviews: true } } },
  })));
  res.json(candidates);
});

router.post('/:id/resume', authorize('admin', 'recruiter'), upload.single('resume'), async (req, res) => {
  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  let resumeText = '';
  try {
    const buffer = fs.readFileSync(req.file.path);
    const data = await pdf(buffer);
    resumeText = data.text;
  } catch {}

  const candidate = await prisma.candidate.update({
    where: { id: req.params.id },
    data: { resumeUrl, resumeText },
  });
  await req.logActivity('UPLOAD_RESUME', 'Candidate', candidate.id, {});
  res.json(candidate);
});

router.delete('/:id/resume', authorize('admin', 'recruiter'), async (req, res) => {
  const candidate = await prisma.candidate.update({
    where: { id: req.params.id },
    data: { resumeUrl: null, resumeText: null },
  });
  res.json(candidate);
});

module.exports = router;
