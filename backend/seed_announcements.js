require('./config/env');
const mongoose = require('mongoose');
const Announcement = require('./models/Announcement');
const User = require('./models/User');

const announcements = [
  {
    title: 'TCS National Qualifier Test (NQT) & Digital / Ninja Recruitment Drive',
    companyName: 'Tata Consultancy Services (TCS)',
    companyLogo: 'https://logo.clearbit.com/tcs.com',
    jobRole: 'Software Engineer / Graduate Trainee',
    description: 'TCS is inviting applications for its flagship National Qualifier Test (NQT) across India. Selected candidates will be offered roles under TCS Digital or TCS Ninja bands based on test performance and interview rounds. The role entails developing enterprise-grade cloud native software, microservices, and AI-enabled client platforms.',
    package: '7.2 - 9.0 LPA (Digital) | 3.6 - 4.5 LPA (Ninja)',
    eligibility: 'MCA / B.Tech / BE / M.Tech (Min 60% or 6.0 CGPA across 10th, 12th, UG, PG. Max 1 active backlog allowed).',
    requiredSkills: ['JavaScript', 'React.js', 'Node.js', 'Data Structures & Algorithms', 'SQL', 'Problem Solving'],
    location: 'Ahmedabad / Pune / Bengaluru / Hyderabad / Pan-India',
    driveDate: new Date('2026-08-28T09:00:00Z'),
    applicationDeadline: new Date('2026-08-26T23:59:59Z'),
    interviewDate: new Date('2026-08-30T10:00:00Z'),
    instructions: '1. Complete TCS NextStep portal registration.\n2. Ensure your latest resume is uploaded to the Placement Portal.\n3. Mandatory formal attire for virtual interviews.',
    applicationLink: 'https://nextstep.tcs.com/campus',
    priority: 'Urgent',
    status: 'Published'
  },
  {
    title: 'Infosys Specialist Programmer (SP) & Digital Specialist Engineer (DSE)',
    companyName: 'Infosys',
    companyLogo: 'https://logo.clearbit.com/infosys.com',
    jobRole: 'Specialist Programmer (SP)',
    description: 'Infosys is conducting an off-campus / on-campus assessment for premier coding talent. Roles require high algorithmic proficiency, dynamic programming expertise, and deep understanding of distributed systems.',
    package: '9.5 LPA (SP) | 6.25 LPA (DSE)',
    eligibility: 'MCA / B.Tech / M.Tech (Class of 2026). No standing arrears during final onboarding.',
    requiredSkills: ['Python', 'Java', 'Data Structures', 'System Design', 'Algorithms', 'Cloud Basics'],
    location: 'Bengaluru / Pune / Mysuru',
    driveDate: new Date('2026-09-05T09:00:00Z'),
    applicationDeadline: new Date('2026-09-02T18:00:00Z'),
    interviewDate: new Date('2026-09-08T10:00:00Z'),
    instructions: 'HackWithInfy / InfyTQ certified candidates are eligible for direct interview fast-track.',
    applicationLink: 'https://careers.infosys.com/joblist',
    priority: 'High',
    status: 'Published'
  },
  {
    title: 'Amazon Web Services (AWS) - Cloud Support Associate & SDE Intern',
    companyName: 'Amazon',
    companyLogo: 'https://logo.clearbit.com/amazon.com',
    jobRole: 'Software Development Engineer (SDE-1)',
    description: 'Amazon is hiring SDE Interns & Full-Time Engineers for AWS Core Services. Candidates will build high-scale cloud distributed systems, solve multi-threading concurrency challenges, and architect resilient services.',
    package: '28.0 - 32.0 LPA CTC (Includes Base + Stocks)',
    eligibility: 'MCA / B.Tech / M.Tech (Strong fundamentals in OS, Networking, OOP, and DSA).',
    requiredSkills: ['C++', 'Java', 'Distributed Systems', 'AWS', 'Linux', 'Microservices'],
    location: 'Hyderabad / Bengaluru / Delhi-NCR',
    driveDate: new Date('2026-09-12T09:00:00Z'),
    applicationDeadline: new Date('2026-09-09T23:59:59Z'),
    interviewDate: new Date('2026-09-15T10:00:00Z'),
    instructions: 'Online coding challenge on HackerRank (3 Questions, 90 Mins). Review Amazon Leadership Principles before round 2.',
    applicationLink: 'https://amazon.jobs/en/jobs',
    priority: 'High',
    status: 'Published'
  },
  {
    title: 'Wipro Elite National Talent Hunt (NTH) Campus Drive',
    companyName: 'Wipro Technologies',
    companyLogo: 'https://logo.clearbit.com/wipro.com',
    jobRole: 'Project Engineer (Turbo / Elite)',
    description: 'Wipro Elite NTH offers a gateway to global IT consulting and digital transformation projects. Assesses quantitative aptitude, logical reasoning, verbal agility, and live coding.',
    package: '6.5 LPA (Turbo) | 3.5 LPA (Elite)',
    eligibility: 'MCA / BE / B.Tech (60% or 6.0 CGPA and above throughout education).',
    requiredSkills: ['Java', 'C#', 'Web Technologies', 'Database Systems', 'Agile Methodologies'],
    location: 'Ahmedabad / Chennai / Kolkata / Noida',
    driveDate: new Date('2026-09-18T09:00:00Z'),
    applicationDeadline: new Date('2026-09-14T17:00:00Z'),
    interviewDate: new Date('2026-09-20T10:00:00Z'),
    instructions: 'Mandatory mock test preparation on portal before the official national drive.',
    applicationLink: 'https://careers.wipro.com',
    priority: 'Medium',
    status: 'Published'
  },
  {
    title: 'Accenture Innovation Hub - Associate Software Engineer (ASE & FSE)',
    companyName: 'Accenture',
    companyLogo: 'https://logo.clearbit.com/accenture.com',
    jobRole: 'Full Stack Engineer (FSE)',
    description: 'Accenture is looking for forward-thinking full stack developers specializing in React, Node, Spring Boot, and AI integrations for international clients.',
    package: '6.5 - 8.5 LPA',
    eligibility: 'MCA / B.Tech (All engineering streams). Full academic consistency with no active backlogs.',
    requiredSkills: ['React.js', 'Node.js', 'REST APIs', 'Git', 'Cloud Computing', 'SQL'],
    location: 'Mumbai / Pune / Gurugram / Bengaluru',
    driveDate: new Date('2026-09-25T09:00:00Z'),
    applicationDeadline: new Date('2026-09-22T23:59:59Z'),
    interviewDate: new Date('2026-09-28T10:00:00Z'),
    instructions: 'Cognitive & Technical assessment followed by Coding round and Communication assessment.',
    applicationLink: 'https://indiacampus.accenture.com',
    priority: 'Medium',
    status: 'Published'
  }
];

async function seedAnnouncements() {
  console.log('=== SEEDING REALISTIC COMPANY REQUIREMENTS & ANNOUNCEMENTS ===');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);

  const admin = await User.findOne({ role: 'admin' });
  const adminId = admin ? admin._id : null;

  for (const ann of announcements) {
    await Announcement.findOneAndUpdate(
      { title: ann.title },
      { ...ann, createdBy: adminId },
      { upsert: true, new: true }
    );
  }

  console.log(`✓ Successfully seeded ${announcements.length} published company announcements into MongoDB.`);
  await mongoose.connection.close();
}

seedAnnouncements().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
