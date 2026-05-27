const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authorize('admin'), async (req, res) => {
  const { page = 1, limit = 50, entity, search } = req.query;
  const where = {};
  if (entity) where.entity = entity;
  if (search) where.OR = [
    { action: { contains: search, mode: 'insensitive' } },
    { entity: { contains: search, mode: 'insensitive' } },
  ];

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip: (page - 1) * limit, take: Number(limit),
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);
  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get('/activity', async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    take: 20,
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(logs);
});

module.exports = router;
