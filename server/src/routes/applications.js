const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { status, jobId, recruiterId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (jobId) where.jobId = jobId;
  if (recruiterId) where.recruiterId = recruiterId;

  const applications = await prisma.application.findMany({
    where,
    include: {
      candidate: true,
      job: true,
      recruiter: { select: { id: true, name: true } },
      interviews: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

router.post('/', async (req, res) => {
  const { candidateId, jobId, recruiterId } = req.body;
  const existing = await prisma.application.findFirst({ where: { candidateId, jobId } });
  if (existing) return res.status(409).json({ error: 'Application already exists' });

  const application = await prisma.application.create({
    data: { candidateId, jobId, recruiterId: recruiterId || req.user.id },
    include: { candidate: true, job: true },
  });
  await req.logActivity('CREATE', 'Application', application.id, { candidateId, jobId });
  res.status(201).json(application);
});

router.patch('/:id/status', async (req, res) => {
  const { status, offerAmount } = req.body;
  const previous = await prisma.application.findUnique({ where: { id: req.params.id }, select: { status: true } });
  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { status, ...(offerAmount && { offerAmount }) },
    include: { candidate: true, job: true },
  });
  await req.logActivity('STATUS_CHANGE', 'Application', application.id, {
    candidateName: application.candidate.name,
    jobTitle: application.job.title,
    from: previous.status,
    to: status,
  });
  res.json(application);
});

router.patch('/:id/notes', async (req, res) => {
  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { notes: req.body.notes },
  });
  res.json(application);
});

module.exports = router;
