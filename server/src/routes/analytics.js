const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/overview', async (req, res) => {
  const [totalCandidates, totalJobs, totalApplications, totalInterviews] = await Promise.all([
    prisma.candidate.count(),
    prisma.jobOpening.count({ where: { status: 'open' } }),
    prisma.application.count(),
    prisma.interview.count({ where: { status: 'scheduled' } }),
  ]);
  const hiredThisMonth = await prisma.application.count({
    where: { status: 'hired', updatedAt: { gte: new Date(new Date().setDate(1)) } },
  });
  res.json({ totalCandidates, totalJobs, totalApplications, totalInterviews, hiredThisMonth });
});

router.get('/funnel', async (req, res) => {
  const statuses = ['applied', 'screening', 'interview', 'offer', 'hired'];
  const data = await Promise.all(
    statuses.map(async status => ({ status, count: await prisma.application.count({ where: { status } }) }))
  );
  res.json(data);
});

router.get('/recruiters', async (req, res) => {
  const recruiters = await prisma.user.findMany({
    where: { role: { in: ['recruiter', 'admin'] } },
    select: { id: true, name: true, _count: { select: { applications: true } } },
  });
  const data = await Promise.all(recruiters.map(async r => ({
    name: r.name,
    applications: r._count.applications,
    hired: await prisma.application.count({ where: { recruiterId: r.id, status: 'hired' } }),
  })));
  res.json(data);
});

router.get('/source-roi', async (req, res) => {
  const candidates = await prisma.candidate.findMany({
    select: { source: true, applications: { select: { status: true } } },
  });
  const sourceMap = {};
  candidates.forEach(c => {
    const src = c.source || 'Unknown';
    if (!sourceMap[src]) sourceMap[src] = { source: src, total: 0, hired: 0 };
    sourceMap[src].total++;
    if (c.applications.some(a => a.status === 'hired')) sourceMap[src].hired++;
  });
  res.json(Object.values(sourceMap));
});

router.get('/time-to-hire', async (req, res) => {
  const hired = await prisma.application.findMany({
    where: { status: 'hired' },
    select: { createdAt: true, updatedAt: true, job: { select: { department: true } } },
  });
  const byDept = {};
  hired.forEach(a => {
    const dept = a.job.department;
    const days = Math.round((a.updatedAt - a.createdAt) / (1000 * 60 * 60 * 24));
    if (!byDept[dept]) byDept[dept] = { department: dept, days: [] };
    byDept[dept].days.push(days);
  });
  const result = Object.values(byDept).map(d => ({
    department: d.department,
    avgDays: Math.round(d.days.reduce((a, b) => a + b, 0) / d.days.length),
  }));
  res.json(result);
});

router.get('/department', async (req, res) => {
  const jobs = await prisma.jobOpening.findMany({
    select: { department: true, _count: { select: { applications: true } } },
  });
  const deptMap = {};
  jobs.forEach(j => {
    if (!deptMap[j.department]) deptMap[j.department] = { department: j.department, count: 0 };
    deptMap[j.department].count += j._count.applications;
  });
  res.json(Object.values(deptMap));
});

router.get('/offer-acceptance', async (req, res) => {
  const offers = await prisma.application.count({ where: { status: { in: ['offer', 'hired'] } } });
  const hired = await prisma.application.count({ where: { status: 'hired' } });
  const rejected = await prisma.application.count({ where: { status: 'rejected' } });
  res.json({ offers, hired, rejected, acceptanceRate: offers > 0 ? Math.round((hired / offers) * 100) : 0 });
});

router.get('/interviewer-scorecard', async (req, res) => {
  const interviewers = await prisma.user.findMany({
    where: { role: 'interviewer' },
    select: {
      id: true, name: true,
      interviews: { where: { status: 'completed' }, select: { rating: true } },
    },
  });
  const data = interviewers.map(i => ({
    name: i.name,
    total: i.interviews.length,
    avgRating: i.interviews.length > 0
      ? (i.interviews.reduce((s, iv) => s + (iv.rating || 0), 0) / i.interviews.length).toFixed(1)
      : 0,
  }));
  res.json(data);
});

router.get('/health-score', async (req, res) => {
  const [open, hired, rejected, total] = await Promise.all([
    prisma.jobOpening.count({ where: { status: 'open' } }),
    prisma.application.count({ where: { status: 'hired' } }),
    prisma.application.count({ where: { status: 'rejected' } }),
    prisma.application.count(),
  ]);
  const score = total > 0 ? Math.round(((hired * 2 - rejected * 0.5 + open * 5) / (total + 1)) * 10) : 50;
  res.json({ score: Math.min(100, Math.max(0, score)), open, hired, rejected, total });
});

module.exports = router;
