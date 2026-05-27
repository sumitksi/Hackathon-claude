const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { status, department } = req.query;
  const where = {};
  if (status) where.status = status;
  if (department) where.department = { contains: department, mode: 'insensitive' };

  const jobs = await prisma.jobOpening.findMany({
    where,
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
});

router.post('/', authorize('admin', 'recruiter'), async (req, res) => {
  const job = await prisma.jobOpening.create({ data: req.body });
  await req.logActivity('CREATE', 'JobOpening', job.id, { title: job.title });
  res.status(201).json(job);
});

router.put('/:id', authorize('admin', 'recruiter'), async (req, res) => {
  const job = await prisma.jobOpening.update({ where: { id: req.params.id }, data: req.body });
  await req.logActivity('UPDATE', 'JobOpening', job.id, { title: job.title });
  res.json(job);
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  await prisma.jobOpening.delete({ where: { id: req.params.id } });
  await req.logActivity('DELETE', 'JobOpening', req.params.id, {});
  res.json({ message: 'Deleted' });
});

module.exports = router;
