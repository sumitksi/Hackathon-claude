const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// Theme colors
const BG = '#0d1117';
const SURFACE = '#161b27';
const CARD = '#1c2333';
const ACCENT = '#1f6feb';
const PURPLE = '#8b5cf6';
const TEAL = '#2dd4bf';
const WHITE = '#f0f6fc';
const MUTED = '#8d96a0';
const BORDER = '#30363d';

pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

function addSlide(opts) {
  const slide = pptx.addSlide();
  // Dark background
  slide.background = { color: BG.replace('#', '') };
  // Optional top accent bar
  if (opts.accent !== false) {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: ACCENT.replace('#', '') } });
  }
  return slide;
}

function addTitle(slide, text, y = 0.35) {
  slide.addText(text, {
    x: 0.5, y, w: 12.33, h: 0.6,
    fontSize: 28, bold: true, color: WHITE.replace('#', ''),
    fontFace: 'Segoe UI',
  });
}

function addSubtitle(slide, text, y = 1.0) {
  slide.addText(text, {
    x: 0.5, y, w: 12.33, h: 0.4,
    fontSize: 14, color: MUTED.replace('#', ''),
    fontFace: 'Segoe UI',
  });
}

function addCard(slide, x, y, w, h, title, lines, titleColor = ACCENT) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: SURFACE.replace('#', '') },
    line: { color: BORDER.replace('#', ''), width: 1 },
  });
  slide.addText(title, {
    x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.3,
    fontSize: 11, bold: true, color: titleColor.replace('#', ''),
    fontFace: 'Segoe UI',
  });
  lines.forEach((line, i) => {
    slide.addText('• ' + line, {
      x: x + 0.15, y: y + 0.5 + i * 0.28, w: w - 0.3, h: 0.27,
      fontSize: 9.5, color: WHITE.replace('#', ''),
      fontFace: 'Segoe UI',
    });
  });
}

function addBadge(slide, x, y, text, color = ACCENT) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 1.6, h: 0.28,
    fill: { color: color.replace('#', '') },
    line: { color: color.replace('#', ''), width: 0 },
    rectRadius: 0.04,
  });
  slide.addText(text, {
    x, y, w: 1.6, h: 0.28,
    fontSize: 8.5, bold: true, color: WHITE.replace('#', ''),
    align: 'center', fontFace: 'Segoe UI',
  });
}

// ─────────────────────────────────────────────
// SLIDE 1: TITLE
// ─────────────────────────────────────────────
{
  const slide = addSlide({ accent: false });
  // Gradient-like left block
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 5.2, h: 7.5, fill: { color: SURFACE.replace('#', '') } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ACCENT.replace('#', '') } });

  slide.addText('🐝', { x: 0.6, y: 1.6, w: 1.5, h: 1.5, fontSize: 64, align: 'center' });
  slide.addText('ReportBee', {
    x: 0.5, y: 3.2, w: 4.2, h: 0.7,
    fontSize: 34, bold: true, color: WHITE.replace('#', ''),
    fontFace: 'Segoe UI',
  });
  slide.addText('Recruitment MIS Platform', {
    x: 0.5, y: 3.95, w: 4.2, h: 0.4,
    fontSize: 15, color: MUTED.replace('#', ''),
    fontFace: 'Segoe UI',
  });
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.55, w: 1.5, h: 0.04, fill: { color: TEAL.replace('#', '') } });

  slide.addText('Built with Node.js · React · PostgreSQL · Claude AI', {
    x: 0.5, y: 4.75, w: 4.2, h: 0.3,
    fontSize: 9.5, color: MUTED.replace('#', ''),
    fontFace: 'Segoe UI',
  });

  // Right side — tagline
  slide.addText('End-to-end recruitment\nmanagement powered\nby AI insights', {
    x: 5.7, y: 2.4, w: 6.9, h: 1.8,
    fontSize: 26, bold: true, color: WHITE.replace('#', ''),
    fontFace: 'Segoe UI', lineSpacingMultiple: 1.3,
  });
  slide.addText('Track candidates, manage pipelines, schedule interviews,\nand make smarter hiring decisions — all in one place.', {
    x: 5.7, y: 4.4, w: 6.9, h: 0.7,
    fontSize: 12, color: MUTED.replace('#', ''),
    fontFace: 'Segoe UI',
  });
}

// ─────────────────────────────────────────────
// SLIDE 2: THE PROBLEM WE SOLVE
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'The Problem We Solve');
  addSubtitle(slide, 'Modern hiring teams are drowning in scattered tools and manual processes');

  const problems = [
    ['Fragmented Data', 'Candidate info spread across spreadsheets, emails, and sticky notes'],
    ['No Pipeline Visibility', 'No real-time view of where each candidate stands in the funnel'],
    ['Manual Screening', 'Hours spent reading resumes with no AI assistance'],
    ['Poor Collaboration', 'Recruiters and interviewers working in silos'],
    ['Zero Analytics', 'No data on time-to-hire, source ROI, or recruiter performance'],
    ['Slow Communication', 'Writing rejection emails manually, one by one'],
  ];

  problems.forEach(([title, desc], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 4.3;
    const y = 1.6 + row * 2.3;
    addCard(slide, x, y, 4.0, 2.0, title, [desc], ACCENT);
  });
}

// ─────────────────────────────────────────────
// SLIDE 3: PRODUCT OVERVIEW
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'What is ReportBee?');
  addSubtitle(slide, 'A full-stack recruitment management system for modern HR teams');

  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 5.8, h: 5.5, fill: { color: SURFACE.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
  slide.addText('Core Platform', { x: 0.7, y: 1.65, w: 5.4, h: 0.35, fontSize: 12, bold: true, color: TEAL.replace('#', ''), fontFace: 'Segoe UI' });

  const coreFeatures = [
    'Candidate database with resume parsing',
    'Kanban pipeline board (drag & drop)',
    'Job openings management',
    'Interview scheduling & feedback',
    'Role-based access control (4 roles)',
    'Real-time activity feed via WebSockets',
    'Audit log for all actions',
    'Duplicate candidate detection',
  ];
  coreFeatures.forEach((f, i) => {
    slide.addText('✓  ' + f, { x: 0.7, y: 2.1 + i * 0.35, w: 5.4, h: 0.32, fontSize: 10, color: WHITE.replace('#', ''), fontFace: 'Segoe UI' });
  });

  slide.addShape(pptx.ShapeType.rect, { x: 6.9, y: 1.5, w: 5.9, h: 5.5, fill: { color: SURFACE.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
  slide.addText('AI-Powered Layer', { x: 7.1, y: 1.65, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: PURPLE.replace('#', ''), fontFace: 'Segoe UI' });

  const aiFeatures = [
    'Natural language candidate search',
    'Typo-tolerant fuzzy query matching',
    'Candidate profile summarization',
    'AI job description generator',
    'Culture fit scoring (0–100)',
    'Interview question generation',
    'Empathetic rejection email drafting',
    'Powered by Claude Sonnet (Anthropic)',
  ];
  aiFeatures.forEach((f, i) => {
    slide.addText('✦  ' + f, { x: 7.1, y: 2.1 + i * 0.35, w: 5.5, h: 0.32, fontSize: 10, color: WHITE.replace('#', ''), fontFace: 'Segoe UI' });
  });
}

// ─────────────────────────────────────────────
// SLIDE 4: TECH STACK
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Technology Stack');
  addSubtitle(slide, 'Modern, production-grade technologies chosen for reliability and developer experience');

  const stacks = [
    { title: 'Frontend', color: ACCENT, items: ['React 19 + Vite', 'TailwindCSS v4', 'React Router v7', 'Recharts (analytics)', 'Socket.io-client', 'React Hook Form', 'Lucide Icons'] },
    { title: 'Backend', color: TEAL, items: ['Node.js + Express', 'Prisma ORM v5', 'PostgreSQL 16', 'Socket.io (real-time)', 'Multer (file uploads)', 'pdf-parse (resume text)', 'express-async-errors'] },
    { title: 'Auth & Security', color: PURPLE, items: ['JWT (jsonwebtoken)', 'bcryptjs (password hash)', 'RBAC (4 roles)', 'Token in localStorage', 'Role-gated API routes', 'Audit trail logging'] },
    { title: 'AI & Infra', color: '#f97316', items: ['Anthropic Claude Sonnet', '@anthropic-ai/sdk', 'Docker (PostgreSQL)', 'dotenv config', 'nodemon (dev)', 'pptxgenjs (reporting)'] },
  ];

  stacks.forEach((stack, i) => {
    const x = 0.5 + i * 3.25;
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.5, w: 3.0, h: 5.5, fill: { color: SURFACE.replace('#', '') }, line: { color: stack.color.replace('#', ''), width: 1.5 } });
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.5, w: 3.0, h: 0.45, fill: { color: stack.color.replace('#', '') } });
    slide.addText(stack.title, { x: x + 0.1, y: 1.55, w: 2.8, h: 0.35, fontSize: 11, bold: true, color: WHITE.replace('#', ''), fontFace: 'Segoe UI', align: 'center' });
    stack.items.forEach((item, j) => {
      slide.addText(item, { x: x + 0.15, y: 2.1 + j * 0.63, w: 2.7, h: 0.55, fontSize: 9.5, color: WHITE.replace('#', ''), fontFace: 'Segoe UI', align: 'center' });
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 5: SYSTEM ARCHITECTURE
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'System Architecture');
  addSubtitle(slide, 'Three-tier architecture with real-time WebSocket layer and external AI API');

  // Client layer
  slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.5, w: 3.5, h: 4.8, fill: { color: SURFACE.replace('#', '') }, line: { color: ACCENT.replace('#', ''), width: 1.5 } });
  slide.addText('CLIENT LAYER', { x: 0.4, y: 1.55, w: 3.5, h: 0.3, fontSize: 9, bold: true, color: ACCENT.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  ['React 19 SPA', 'React Router', 'Recharts', 'Socket.io Client', 'TailwindCSS'].forEach((t, i) => {
    slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.0 + i * 0.72, w: 3.1, h: 0.55, fill: { color: CARD.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
    slide.addText(t, { x: 0.6, y: 2.0 + i * 0.72, w: 3.1, h: 0.55, fontSize: 9.5, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  });

  // Arrow
  slide.addShape(pptx.ShapeType.rect, { x: 3.9, y: 3.7, w: 1.0, h: 0.04, fill: { color: MUTED.replace('#', '') } });
  slide.addText('HTTP\nWS', { x: 3.9, y: 3.4, w: 1.0, h: 0.5, fontSize: 8, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });

  // Server layer
  slide.addShape(pptx.ShapeType.rect, { x: 4.9, y: 1.5, w: 3.5, h: 4.8, fill: { color: SURFACE.replace('#', '') }, line: { color: TEAL.replace('#', ''), width: 1.5 } });
  slide.addText('SERVER LAYER', { x: 4.9, y: 1.55, w: 3.5, h: 0.3, fontSize: 9, bold: true, color: TEAL.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  ['Express.js API', 'JWT Auth + RBAC', 'Socket.io Server', 'Prisma ORM', 'Multer + pdf-parse'].forEach((t, i) => {
    slide.addShape(pptx.ShapeType.rect, { x: 5.1, y: 2.0 + i * 0.72, w: 3.1, h: 0.55, fill: { color: CARD.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
    slide.addText(t, { x: 5.1, y: 2.0 + i * 0.72, w: 3.1, h: 0.55, fontSize: 9.5, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  });

  // Arrow
  slide.addShape(pptx.ShapeType.rect, { x: 8.4, y: 3.7, w: 1.0, h: 0.04, fill: { color: MUTED.replace('#', '') } });
  slide.addText('SQL', { x: 8.4, y: 3.4, w: 1.0, h: 0.5, fontSize: 8, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });

  // DB layer
  slide.addShape(pptx.ShapeType.rect, { x: 9.4, y: 1.5, w: 2.2, h: 2.3, fill: { color: SURFACE.replace('#', '') }, line: { color: PURPLE.replace('#', ''), width: 1.5 } });
  slide.addText('DATABASE', { x: 9.4, y: 1.55, w: 2.2, h: 0.3, fontSize: 9, bold: true, color: PURPLE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  ['PostgreSQL 16', 'Docker Container', '6 data models'].forEach((t, i) => {
    slide.addText(t, { x: 9.5, y: 2.0 + i * 0.5, w: 2.0, h: 0.45, fontSize: 9, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  });

  // AI layer
  slide.addShape(pptx.ShapeType.rect, { x: 9.4, y: 4.1, w: 2.2, h: 2.2, fill: { color: SURFACE.replace('#', '') }, line: { color: '#f97316', width: 1.5 } });
  slide.addText('AI LAYER', { x: 9.4, y: 4.15, w: 2.2, h: 0.3, fontSize: 9, bold: true, color: '#f97316', align: 'center', fontFace: 'Segoe UI' });
  ['Anthropic API', 'Claude Sonnet', '6 AI endpoints'].forEach((t, i) => {
    slide.addText(t, { x: 9.5, y: 4.6 + i * 0.5, w: 2.0, h: 0.45, fontSize: 9, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  });

  // Port labels
  slide.addText('Port 5173', { x: 0.4, y: 6.5, w: 3.5, h: 0.28, fontSize: 8, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  slide.addText('Port 5000', { x: 4.9, y: 6.5, w: 3.5, h: 0.28, fontSize: 8, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  slide.addText('Port 5432', { x: 9.4, y: 6.5, w: 2.2, h: 0.28, fontSize: 8, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
}

// ─────────────────────────────────────────────
// SLIDE 6: KEY FEATURES — PIPELINE & CANDIDATES
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Feature Highlight: Candidate Pipeline');
  addSubtitle(slide, 'Full-lifecycle candidate management from application to hire');

  addCard(slide, 0.5, 1.5, 3.9, 2.5, 'Candidate Database', [
    'Search & filter by skills, source, role',
    'Paginated table + profile cards',
    'Fuzzy duplicate detection (Levenshtein)',
    'Resume PDF upload + text extraction',
    'Edit, delete (admin only)',
  ], ACCENT);

  addCard(slide, 4.7, 1.5, 3.9, 2.5, 'Kanban Pipeline Board', [
    '6 stages: Applied → Screening → Interview',
    '→ Offer → Hired → Rejected',
    'Drag-and-drop HTML5 API',
    'Each card shows candidate + job title',
    'Status updates sync to DB instantly',
  ], TEAL);

  addCard(slide, 8.9, 1.5, 3.9, 2.5, 'Application Tracking', [
    'Link candidates to job openings',
    'Assign recruiter per application',
    'Track every status change in audit log',
    'View full interview history per app',
    'Bulk pipeline operations',
  ], PURPLE);

  addCard(slide, 0.5, 4.2, 3.9, 2.5, 'Resume Handling', [
    'Multer file upload (PDF/DOC)',
    'pdf-parse auto text extraction',
    'Resume text stored for AI analysis',
    'Download link available in profile',
    'Remove resume option',
  ], '#f97316');

  addCard(slide, 4.7, 4.2, 3.9, 2.5, 'Candidate Profile', [
    'Full profile: skills, experience, location',
    'All applications with current status',
    'Interview history + feedback',
    'AI culture fit score card',
    'AI-generated candidate summary',
  ], ACCENT);

  addCard(slide, 8.9, 4.2, 3.9, 2.5, 'Compare Candidates', [
    'Side-by-side comparison (2–3 people)',
    'Skills, experience, interview ratings',
    'Application history across jobs',
    'Quick shortlist decisions',
  ], TEAL);
}

// ─────────────────────────────────────────────
// SLIDE 7: AI FEATURES
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'AI Features — Powered by Claude Sonnet');
  addSubtitle(slide, 'Anthropic\'s Claude integrated across 6 recruitment workflows');

  const features = [
    { icon: '🔍', title: 'AI Candidate Search', color: ACCENT, lines: ['Natural language queries', 'Typo & spelling tolerant', 'Intent-based matching over skill+role+location', 'UUID regex + keyword fallback', 'Example: "platform engneer 7 yare exp"'] },
    { icon: '📋', title: 'Candidate Summarizer', color: TEAL, lines: ['3–4 sentence professional summary', 'Uses name, role, skills, experience', 'Ingests up to 2000 chars of resume text', 'Plain text output, no markdown', 'One-click in candidate profile'] },
    { icon: '📝', title: 'Job Description Generator', color: PURPLE, lines: ['Input: title, department, requirements', 'Outputs a full JD in plain text', 'HR expert persona for professional tone', 'Editable before saving', 'Speeds up job posting by 10×'] },
    { icon: '🎯', title: 'Culture Fit Scoring', color: '#f97316', lines: ['Score 0–100 with strengths & concerns', 'Compares skills vs job requirements', 'Weighs interview feedback & ratings', 'JSON-structured response parsed safely', 'Per-application, available post-interview'] },
    { icon: '❓', title: 'Interview Question Gen', color: ACCENT, lines: ['Generates exactly 6 questions', 'Role-specific + skill-specific', 'Supports technical / behavioral / HR types', 'Parsed from JSON array response', 'Use directly in interview form'] },
    { icon: '✉️', title: 'Rejection Email Drafter', color: TEAL, lines: ['Empathetic, professional tone', 'Candidate name + reason as input', 'Concise plain text output', 'Reduces recruiter writing time', 'One click from application screen'] },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.4 + col * 4.3;
    const y = 1.5 + row * 2.6;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 4.0, h: 2.35, fill: { color: SURFACE.replace('#', '') }, line: { color: f.color.replace('#', ''), width: 1.2 } });
    slide.addText(f.icon + '  ' + f.title, { x: x + 0.15, y: y + 0.1, w: 3.7, h: 0.32, fontSize: 10.5, bold: true, color: f.color.replace('#', ''), fontFace: 'Segoe UI' });
    f.lines.forEach((line, j) => {
      slide.addText('· ' + line, { x: x + 0.15, y: y + 0.5 + j * 0.34, w: 3.7, h: 0.32, fontSize: 9, color: WHITE.replace('#', ''), fontFace: 'Segoe UI' });
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 8: DATABASE SCHEMA
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Database Schema');
  addSubtitle(slide, '6 Prisma models · PostgreSQL 16 · Docker-hosted');

  const models = [
    { name: 'User', color: ACCENT, fields: ['id (uuid)', 'name, email, password', 'role: admin | recruiter', '       interviewer | viewer', 'createdAt'] },
    { name: 'Candidate', color: TEAL, fields: ['id (uuid)', 'name, email, phone', 'skills (String[])', 'currentRole, experience', 'location, source', 'resumeUrl, resumeText'] },
    { name: 'JobOpening', color: PURPLE, fields: ['id (uuid)', 'title, department', 'description, requirements', 'status: open | closed', '           | draft'] },
    { name: 'Application', color: '#f97316', fields: ['id (uuid)', 'candidateId → Candidate', 'jobId → JobOpening', 'recruiterId → User', 'status (enum 6 values)', 'createdAt, updatedAt'] },
    { name: 'Interview', color: ACCENT, fields: ['id (uuid)', 'applicationId → Application', 'interviewerId → User', 'scheduledAt (DateTime)', 'status, feedback, rating'] },
    { name: 'AuditLog', color: TEAL, fields: ['id (uuid)', 'userId → User', 'action, entity, entityId', 'details (Json)', 'createdAt'] },
  ];

  models.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.4 + col * 4.3;
    const y = 1.5 + row * 2.8;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 4.0, h: 2.55, fill: { color: SURFACE.replace('#', '') }, line: { color: m.color.replace('#', ''), width: 1 } });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 4.0, h: 0.38, fill: { color: m.color.replace('#', '') } });
    slide.addText(m.name, { x: x + 0.15, y: y + 0.05, w: 3.7, h: 0.28, fontSize: 11, bold: true, color: WHITE.replace('#', ''), fontFace: 'Segoe UI Mono' });
    m.fields.forEach((f, j) => {
      slide.addText(f, { x: x + 0.2, y: y + 0.48 + j * 0.37, w: 3.6, h: 0.35, fontSize: 8.8, color: WHITE.replace('#', ''), fontFace: 'Segoe UI Mono' });
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 9: ROLES & PERMISSIONS
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Role-Based Access Control');
  addSubtitle(slide, 'Four roles with granular permission gates on every route and UI component');

  const roles = [
    { role: 'Admin', color: ACCENT, badge: 'Full Access', perms: ['All recruiter & interviewer permissions', 'Create / delete users', 'View full audit log', 'Delete candidates & jobs', 'Access Team management page', 'System-wide configuration'] },
    { role: 'Recruiter', color: TEAL, badge: 'Pipeline Access', perms: ['Add / edit candidates', 'Post and manage job openings', 'Create & move applications', 'Schedule interviews', 'Use all AI features', 'View analytics dashboard'] },
    { role: 'Interviewer', color: PURPLE, badge: 'Interview Access', perms: ['View assigned candidates', 'Submit interview feedback', 'Give ratings per interview', 'View own interview schedule', 'Read-only candidate profiles', 'View own scorecard'] },
    { role: 'Viewer', color: MUTED, badge: 'Read Only', perms: ['View candidates (read-only)', 'View job openings', 'View analytics dashboard', 'No create / edit / delete', 'No AI features access', 'No admin panel access'] },
  ];

  roles.forEach((r, i) => {
    const x = 0.4 + i * 3.25;
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.5, w: 3.0, h: 5.5, fill: { color: SURFACE.replace('#', '') }, line: { color: r.color.replace('#', ''), width: 1.5 } });
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.5, w: 3.0, h: 0.55, fill: { color: r.color.replace('#', '') } });
    slide.addText(r.role, { x: x + 0.1, y: 1.55, w: 2.8, h: 0.3, fontSize: 13, bold: true, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
    slide.addText(r.badge, { x: x + 0.6, y: 2.15, w: 1.8, h: 0.28, fontSize: 8, color: r.color.replace('#', ''), align: 'center', fontFace: 'Segoe UI', bold: true });
    r.perms.forEach((p, j) => {
      slide.addText('✓ ' + p, { x: x + 0.15, y: 2.55 + j * 0.7, w: 2.7, h: 0.6, fontSize: 9, color: WHITE.replace('#', ''), fontFace: 'Segoe UI' });
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 10: ANALYTICS DASHBOARD
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Analytics & Reporting');
  addSubtitle(slide, '8 live analytics widgets built with Recharts, updated on every data change');

  const widgets = [
    { icon: '📊', name: 'Hiring Funnel', desc: 'Bar chart showing candidates at each stage: Applied → Hired' },
    { icon: '🏢', name: 'By Department', desc: 'Applications per department — bar chart for workload visibility' },
    { icon: '🌐', name: 'Source ROI', desc: 'Pie chart: LinkedIn, Referral, Job Board, Direct hire rates' },
    { icon: '⏱', name: 'Time to Hire', desc: 'Avg days from application to hired per department' },
    { icon: '✅', name: 'Offer Acceptance', desc: 'Offers made vs accepted vs rejected — donut chart' },
    { icon: '👤', name: 'Recruiter Performance', desc: 'Applications managed & hired per recruiter' },
    { icon: '⭐', name: 'Interviewer Scorecard', desc: 'Avg rating + total interviews completed per interviewer' },
    { icon: '💚', name: 'Pipeline Health Score', desc: 'Composite 0–100 score: open roles × hired − rejected' },
  ];

  widgets.forEach((w, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.4 + col * 3.15;
    const y = 1.55 + row * 2.65;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 2.9, h: 2.4, fill: { color: SURFACE.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
    slide.addText(w.icon, { x, y: y + 0.15, w: 2.9, h: 0.5, fontSize: 22, align: 'center' });
    slide.addText(w.name, { x: x + 0.15, y: y + 0.72, w: 2.6, h: 0.32, fontSize: 10, bold: true, color: ACCENT.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
    slide.addText(w.desc, { x: x + 0.12, y: y + 1.1, w: 2.66, h: 1.1, fontSize: 8.5, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  });
}

// ─────────────────────────────────────────────
// SLIDE 11: REAL-TIME & AUDIT
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Real-Time Activity & Audit Trail');
  addSubtitle(slide, 'Every action is logged, broadcast live, and permanently stored');

  addCard(slide, 0.5, 1.5, 5.8, 2.8, 'Socket.io Real-Time Feed', [
    'Server emits "activity" event on every write operation',
    'All connected clients receive updates instantly',
    'Activity feed on Dashboard shows last 10 events',
    'Human-readable messages: "moved Tara Allen from screening → interview"',
    'Supports: CREATE, UPDATE, DELETE, STATUS_CHANGE, UPLOAD_RESUME',
  ], TEAL);

  addCard(slide, 6.8, 1.5, 5.9, 2.8, 'Audit Log System', [
    'Every API mutation logs: userId, action, entity, entityId, details',
    'Stored in AuditLog table with full JSON details blob',
    'Admin-only audit log page with full history',
    'Tracks who changed what, when, and from/to what state',
    'Cannot be modified — append-only by design',
  ], PURPLE);

  // Sample activity messages
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.55, w: 12.3, h: 2.55, fill: { color: SURFACE.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
  slide.addText('Sample Activity Messages', { x: 0.7, y: 4.65, w: 6, h: 0.3, fontSize: 10, bold: true, color: MUTED.replace('#', ''), fontFace: 'Segoe UI Mono' });

  const samples = [
    ['Admin User', 'moved Tara Allen from screening → interview', '2 mins ago'],
    ['Sarah Chen', 'added candidate James Rodriguez', '15 mins ago'],
    ['Admin User', 'posted new job: Senior Backend Engineer · Engineering', '1 hr ago'],
    ['Mike Johnson', 'submitted interview feedback for Priya Patel', '2 hrs ago'],
    ['Admin User', 'updated status of DevOps Engineer opening to closed', '3 hrs ago'],
  ];
  samples.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: 5.1 + i * 0.38, w: 0.35, h: 0.28, fill: { color: ACCENT.replace('#', '') }, line: { color: ACCENT.replace('#', ''), width: 0 } });
    slide.addText(s[0], { x: 1.15, y: 5.1 + i * 0.38, w: 1.8, h: 0.28, fontSize: 8.5, bold: true, color: ACCENT.replace('#', ''), fontFace: 'Segoe UI Mono' });
    slide.addText(s[1], { x: 3.0, y: 5.1 + i * 0.38, w: 7.5, h: 0.28, fontSize: 8.5, color: WHITE.replace('#', ''), fontFace: 'Segoe UI Mono' });
    slide.addText(s[2], { x: 10.6, y: 5.1 + i * 0.38, w: 1.8, h: 0.28, fontSize: 8, color: MUTED.replace('#', ''), align: 'right', fontFace: 'Segoe UI' });
  });
}

// ─────────────────────────────────────────────
// SLIDE 12: SETUP & DEPLOYMENT
// ─────────────────────────────────────────────
{
  const slide = addSlide({});
  addTitle(slide, 'Setup & Running the Project');
  addSubtitle(slide, 'Runs in 4 steps — Docker for DB, Node.js for server, Vite for client');

  const steps = [
    { num: '01', title: 'Start PostgreSQL via Docker', color: ACCENT, cmds: ['docker-compose up -d', '# Starts PostgreSQL 16 on port 5432', '# Container: recruitment_mis_db'] },
    { num: '02', title: 'Setup & Migrate Database', color: TEAL, cmds: ['cd server && npm install', 'npx prisma migrate dev', 'node prisma/seed.js', '# Seeds: 25 candidates, jobs, users'] },
    { num: '03', title: 'Start Backend Server', color: PURPLE, cmds: ['cd server', 'npm run dev', '# nodemon — auto-reload on changes', '# Runs on http://localhost:5000'] },
    { num: '04', title: 'Start Frontend (Vite)', color: '#f97316', cmds: ['cd client && npm install', 'npm run dev', '# Vite HMR dev server', '# Opens http://localhost:5173'] },
  ];

  steps.forEach((s, i) => {
    const x = 0.4 + i * 3.2;
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.5, w: 3.0, h: 4.8, fill: { color: SURFACE.replace('#', '') }, line: { color: s.color.replace('#', ''), width: 1.5 } });
    slide.addText(s.num, { x: x + 0.15, y: 1.6, w: 0.6, h: 0.5, fontSize: 22, bold: true, color: s.color.replace('#', ''), fontFace: 'Segoe UI' });
    slide.addText(s.title, { x: x + 0.15, y: 2.15, w: 2.7, h: 0.55, fontSize: 10, bold: true, color: WHITE.replace('#', ''), fontFace: 'Segoe UI' });
    slide.addShape(pptx.ShapeType.rect, { x: x + 0.15, y: 2.85, w: 2.7, h: 2.9, fill: { color: BG.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
    s.cmds.forEach((cmd, j) => {
      const isComment = cmd.startsWith('#');
      slide.addText(cmd, { x: x + 0.25, y: 2.98 + j * 0.6, w: 2.5, h: 0.52, fontSize: 8.5, color: isComment ? MUTED.replace('#', '') : TEAL.replace('#', ''), fontFace: 'Segoe UI Mono' });
    });
  });

  slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 6.5, w: 12.5, h: 0.65, fill: { color: SURFACE.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
  slide.addText('Default Login:  admin@company.com  ·  password123      |      JWT secured  ·  HTTPS-ready  ·  CORS configured', {
    x: 0.4, y: 6.55, w: 12.5, h: 0.5, fontSize: 9, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI Mono',
  });
}

// ─────────────────────────────────────────────
// SLIDE 13: SUMMARY / CLOSING
// ─────────────────────────────────────────────
{
  const slide = addSlide({ accent: false });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 7.5, fill: { color: SURFACE.replace('#', '') } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ACCENT.replace('#', '') } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.2, w: '100%', h: 0.3, fill: { color: BG.replace('#', '') } });

  slide.addText('🐝', { x: 0.5, y: 0.6, w: 1.5, h: 1.5, fontSize: 52, align: 'center' });
  slide.addText('ReportBee', { x: 0.5, y: 2.1, w: 12.3, h: 0.7, fontSize: 36, bold: true, color: WHITE.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  slide.addText('Built to bring clarity, speed, and intelligence to every hire.', { x: 0.5, y: 2.85, w: 12.3, h: 0.45, fontSize: 14, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });

  const pillars = [
    { icon: '⚡', label: 'Real-time', sub: 'WebSocket live feed' },
    { icon: '🤖', label: 'AI-Powered', sub: 'Claude Sonnet' },
    { icon: '🔒', label: 'Secure', sub: 'JWT + RBAC' },
    { icon: '📊', label: 'Analytics', sub: '8 live widgets' },
    { icon: '🗄️', label: 'Robust DB', sub: 'PostgreSQL + Prisma' },
  ];
  pillars.forEach((p, i) => {
    const x = 1.4 + i * 2.15;
    slide.addShape(pptx.ShapeType.rect, { x, y: 3.8, w: 1.9, h: 1.7, fill: { color: BG.replace('#', '') }, line: { color: BORDER.replace('#', ''), width: 1 } });
    slide.addText(p.icon, { x, y: 3.88, w: 1.9, h: 0.55, fontSize: 20, align: 'center' });
    slide.addText(p.label, { x, y: 4.45, w: 1.9, h: 0.3, fontSize: 10, bold: true, color: ACCENT.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
    slide.addText(p.sub, { x, y: 4.78, w: 1.9, h: 0.28, fontSize: 8.5, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI' });
  });

  slide.addText('Node.js · React 19 · PostgreSQL · Prisma · Socket.io · TailwindCSS · Recharts · Anthropic Claude', {
    x: 0.5, y: 6.8, w: 12.3, h: 0.35, fontSize: 8.5, color: MUTED.replace('#', ''), align: 'center', fontFace: 'Segoe UI',
  });
}

pptx.writeFile({ fileName: 'ReportBee_Presentation.pptx' })
  .then(() => console.log('✅  ReportBee_Presentation.pptx created successfully'))
  .catch(err => console.error('Error:', err));
