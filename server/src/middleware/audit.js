const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const logActivity = async (io, userId, action, entity, entityId, details, ipAddress) => {
  const log = await prisma.auditLog.create({
    data: { userId, action, entity, entityId, details, ipAddress },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  io.emit('new_activity', log);
  return log;
};

const auditLog = (io) => (req, res, next) => {
  req.logActivity = (action, entity, entityId, details) =>
    logActivity(io, req.user.id, action, entity, entityId, details, req.ip);
  next();
};

module.exports = { auditLog, logActivity };
