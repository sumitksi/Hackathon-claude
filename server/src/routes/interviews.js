const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { status, interviewerId, applicationId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (interviewerId) where.interviewerId = interviewerId;
  if (applicationId) where.applicationId = applicationId;

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      application: { include: { candidate: true, job: true } },
      interviewer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });
  res.json(interviews);
});

router.post('/', authorize('admin', 'recruiter'), async (req, res) => {
  const interview = await prisma.interview.create({
    data: req.body,
    include: {
      application: { include: { candidate: true, job: true } },
      interviewer: { select: { id: true, name: true } },
    },
  });
  await req.logActivity('SCHEDULE', 'Interview', interview.id, { applicationId: interview.applicationId });
  res.status(201).json(interview);
});

router.patch('/:id/feedback', async (req, res) => {
  const { feedback, rating, status, notes } = req.body;
  const interview = await prisma.interview.update({
    where: { id: req.params.id },
    data: { feedback, rating, status, notes },
    include: { application: { include: { candidate: true } } },
  });
  await req.logActivity('FEEDBACK', 'Interview', interview.id, { rating });
  res.json(interview);
});

router.delete('/:id', authorize('admin', 'recruiter'), async (req, res) => {
  await prisma.interview.delete({ where: { id: req.params.id } });
  await req.logActivity('DELETE', 'Interview', req.params.id, {});
  res.json({ message: 'Deleted' });
});

module.exports = router;
