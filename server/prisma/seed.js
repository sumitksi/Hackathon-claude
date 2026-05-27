const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@company.com' }, update: {}, create: { name: 'Admin User', email: 'admin@company.com', password, role: 'admin' } }),
    prisma.user.upsert({ where: { email: 'sarah@company.com' }, update: {}, create: { name: 'Sarah Recruiter', email: 'sarah@company.com', password, role: 'recruiter' } }),
    prisma.user.upsert({ where: { email: 'mike@company.com' }, update: {}, create: { name: 'Mike Recruiter', email: 'mike@company.com', password, role: 'recruiter' } }),
    prisma.user.upsert({ where: { email: 'alex@company.com' }, update: {}, create: { name: 'Alex Interviewer', email: 'alex@company.com', password, role: 'interviewer' } }),
    prisma.user.upsert({ where: { email: 'jane@company.com' }, update: {}, create: { name: 'Jane Interviewer', email: 'jane@company.com', password, role: 'interviewer' } }),
  ]);

  const jobs = await Promise.all([
    prisma.jobOpening.create({ data: { title: 'Senior Software Engineer', department: 'Engineering', location: 'Remote', type: 'full-time', status: 'open', requirements: ['React', 'Node.js', '5+ years experience'] } }),
    prisma.jobOpening.create({ data: { title: 'Product Manager', department: 'Product', location: 'New York', type: 'full-time', status: 'open', requirements: ['Product strategy', 'Agile', '3+ years experience'] } }),
    prisma.jobOpening.create({ data: { title: 'UX Designer', department: 'Design', location: 'San Francisco', type: 'full-time', status: 'open', requirements: ['Figma', 'User research', 'Portfolio'] } }),
    prisma.jobOpening.create({ data: { title: 'Data Scientist', department: 'Data', location: 'Remote', type: 'full-time', status: 'open', requirements: ['Python', 'ML', 'Statistics'] } }),
    prisma.jobOpening.create({ data: { title: 'DevOps Engineer', department: 'Engineering', location: 'Austin', type: 'full-time', status: 'on_hold', requirements: ['AWS', 'Kubernetes', 'CI/CD'] } }),
  ]);

  const candidateData = [
    { name: 'Alice Johnson', email: 'alice@email.com', currentRole: 'Software Engineer', skills: ['React', 'Node.js', 'TypeScript'], experience: 5, source: 'LinkedIn', location: 'New York' },
    { name: 'Bob Smith', email: 'bob@email.com', currentRole: 'Senior Developer', skills: ['Python', 'Django', 'AWS'], experience: 7, source: 'Referral', location: 'Remote' },
    { name: 'Carol Davis', email: 'carol@email.com', currentRole: 'Product Manager', skills: ['Agile', 'Jira', 'Strategy'], experience: 4, source: 'Indeed', location: 'Chicago' },
    { name: 'David Lee', email: 'david@email.com', currentRole: 'UX Designer', skills: ['Figma', 'Sketch', 'User Research'], experience: 3, source: 'Portfolio', location: 'San Francisco' },
    { name: 'Emma Wilson', email: 'emma@email.com', currentRole: 'Data Analyst', skills: ['Python', 'SQL', 'Tableau'], experience: 2, source: 'LinkedIn', location: 'Boston' },
    { name: 'Frank Brown', email: 'frank@email.com', currentRole: 'DevOps Engineer', skills: ['AWS', 'Docker', 'Kubernetes'], experience: 6, source: 'Referral', location: 'Austin' },
    { name: 'Grace Taylor', email: 'grace@email.com', currentRole: 'Frontend Developer', skills: ['Vue.js', 'CSS', 'JavaScript'], experience: 3, source: 'GitHub', location: 'Seattle' },
    { name: 'Henry Martinez', email: 'henry@email.com', currentRole: 'Backend Developer', skills: ['Java', 'Spring', 'MySQL'], experience: 8, source: 'LinkedIn', location: 'Miami' },
    { name: 'Iris Chen', email: 'iris@email.com', currentRole: 'ML Engineer', skills: ['TensorFlow', 'Python', 'Statistics'], experience: 4, source: 'Conference', location: 'Remote' },
    { name: 'Jack Thompson', email: 'jack@email.com', currentRole: 'Full Stack Developer', skills: ['React', 'Express', 'MongoDB'], experience: 5, source: 'Indeed', location: 'Denver' },
    { name: 'Karen White', email: 'karen@email.com', currentRole: 'Product Designer', skills: ['Figma', 'Prototyping', 'CSS'], experience: 6, source: 'LinkedIn', location: 'Los Angeles' },
    { name: 'Liam Harris', email: 'liam@email.com', currentRole: 'Data Engineer', skills: ['Spark', 'Python', 'Kafka'], experience: 5, source: 'Referral', location: 'New York' },
    { name: 'Mia Clark', email: 'mia@email.com', currentRole: 'iOS Developer', skills: ['Swift', 'Xcode', 'Objective-C'], experience: 4, source: 'Indeed', location: 'San Jose' },
    { name: 'Noah Robinson', email: 'noah@email.com', currentRole: 'Security Engineer', skills: ['Penetration Testing', 'AWS Security', 'SIEM'], experience: 7, source: 'LinkedIn', location: 'Washington DC' },
    { name: 'Olivia Garcia', email: 'olivia@email.com', currentRole: 'Technical Writer', skills: ['Documentation', 'API Writing', 'Markdown'], experience: 3, source: 'Indeed', location: 'Remote' },
    { name: 'Peter Anderson', email: 'peter@email.com', currentRole: 'Cloud Architect', skills: ['AWS', 'Azure', 'GCP'], experience: 10, source: 'Referral', location: 'Phoenix' },
    { name: 'Quinn Lewis', email: 'quinn@email.com', currentRole: 'QA Engineer', skills: ['Selenium', 'Jest', 'Cypress'], experience: 4, source: 'LinkedIn', location: 'Portland' },
    { name: 'Rachel Young', email: 'rachel@email.com', currentRole: 'Scrum Master', skills: ['Agile', 'Scrum', 'Jira'], experience: 6, source: 'LinkedIn', location: 'Nashville' },
    { name: 'Sam Hall', email: 'sam@email.com', currentRole: 'Android Developer', skills: ['Kotlin', 'Android SDK', 'Firebase'], experience: 3, source: 'GitHub', location: 'Atlanta' },
    { name: 'Tara Allen', email: 'tara@email.com', currentRole: 'Solutions Architect', skills: ['AWS', 'System Design', 'Microservices'], experience: 9, source: 'Conference', location: 'Dallas' },
    { name: 'Uma Patel', email: 'uma@email.com', currentRole: 'Business Analyst', skills: ['SQL', 'Power BI', 'Requirements'], experience: 5, source: 'LinkedIn', location: 'Houston' },
    { name: 'Victor King', email: 'victor@email.com', currentRole: 'SRE', skills: ['Go', 'Prometheus', 'Grafana'], experience: 6, source: 'Referral', location: 'Remote' },
    { name: 'Wendy Scott', email: 'wendy@email.com', currentRole: 'React Developer', skills: ['React', 'TypeScript', 'GraphQL'], experience: 4, source: 'LinkedIn', location: 'Minneapolis' },
    { name: 'Xavier Green', email: 'xavier@email.com', currentRole: 'Platform Engineer', skills: ['Terraform', 'Helm', 'ArgoCD'], experience: 7, source: 'GitHub', location: 'Salt Lake City' },
    { name: 'Yara Adams', email: 'yara@email.com', currentRole: 'Researcher', skills: ['NLP', 'Research', 'Python'], experience: 5, source: 'Conference', location: 'Cambridge' },
  ];

  const statuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  for (let i = 0; i < candidateData.length; i++) {
    const candidate = await prisma.candidate.create({ data: candidateData[i] });
    const job = jobs[i % jobs.length];
    const status = statuses[i % statuses.length];
    const recruiter = users[1 + (i % 2)];

    const application = await prisma.application.create({
      data: { candidateId: candidate.id, jobId: job.id, recruiterId: recruiter.id, status },
    });

    if (['interview', 'offer', 'hired'].includes(status)) {
      await prisma.interview.create({
        data: {
          applicationId: application.id,
          interviewerId: users[3 + (i % 2)].id,
          scheduledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          type: ['technical', 'hr', 'system_design'][i % 3],
          status: 'completed',
          rating: Math.floor(Math.random() * 3) + 3,
          feedback: 'Good candidate with strong technical skills.',
        },
      });
    }
  }

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
