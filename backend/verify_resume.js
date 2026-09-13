require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Resume = require('./models/Resume');
const ResumeScan = require('./models/ResumeScan');
const Company = require('./models/Company');
const jwt = require('./utils/jwt');
const { parseResumeText } = require('./services/resumeParser.service');
const { analyzeResume } = require('./services/atsAnalyzer.service');
const resumeAIProvider = require('./providers/resumeAI.provider');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);
};

async function runResumeTests() {
  console.log('--- STARTING COMPREHENSIVE RESUME SCANNER VERIFICATION ---');
  await connectDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Create Test Students (Student A & Student B for isolation)
    let studentA = await User.findOne({ email: 'resume_student_a@example.com' });
    if (!studentA) {
      studentA = await User.create({
        name: 'Hardik Resume Candidate',
        email: 'resume_student_a@example.com',
        password: 'password123',
        role: 'student',
        college: 'Marwadi University',
        branch: 'MCA'
      });
    }

    let studentB = await User.findOne({ email: 'resume_student_b@example.com' });
    if (!studentB) {
      studentB = await User.create({
        name: 'Other Student B',
        email: 'resume_student_b@example.com',
        password: 'password123',
        role: 'student'
      });
    }

    const tokenA = jwt.signAccessToken({ sub: studentA._id.toString(), role: studentA.role });
    const tokenB = jwt.signAccessToken({ sub: studentB._id.toString(), role: studentB.role });

    const headersA = { 'Authorization': `Bearer ${tokenA}` };
    const headersB = { 'Authorization': `Bearer ${tokenB}` };

    // 2. Test Parser & Extractor on realistic resume text
    const sampleResumeText = `
HARDIK JETHAVA
Email: hardik.jethava@example.com | Phone: +91 9876543210
Rajkot, Gujarat, India
LinkedIn: linkedin.com/in/hardik-jethava | GitHub: github.com/hardikjethava

PROFESSIONAL SUMMARY
Results-driven Software Engineer with extensive expertise in full-stack web applications, REST API design, and distributed systems. Passionate about architecting scalable microservices and solving algorithmic challenges.

EDUCATION
Master of Computer Applications (MCA)
Marwadi University, Rajkot
2024 - 2026 | CGPA: 8.8 / 10.0

Bachelor of Computer Applications (BCA)
Gujarat University, Ahmedabad
2021 - 2024 | CGPA: 8.4 / 10.0

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, C++, SQL, HTML5, CSS3
Frameworks: React, Node.js, Express, Next.js, Tailwind CSS
Databases: MongoDB, PostgreSQL, Redis, MySQL
Tools & Cloud: Git, GitHub, Docker, AWS, Postman, Linux
Core CS: Data Structures & Algorithms, OOP, DBMS, Computer Networks, Operating Systems

PROJECTS
Placement Preparation Portal
Technologies: React, Node.js, MongoDB, Express, Docker
- Engineered high-performance educational platform featuring code compilation, test arena, and ATS resume scanning.
- Decreased query execution time by 35% through Redis caching and optimized MongoDB aggregations.

Cloud Distributed Task Runner
Technologies: Python, Docker, Redis, AWS
- Developed asynchronous task distribution service handling 5,000+ jobs per minute with fault-tolerant worker nodes.

EXPERIENCE
Software Engineering Intern
TechCorp Solutions
May 2025 - Aug 2025
- Built and shipped scalable RESTful backend microservices in Node.js.
- Implemented JWT cookie-based session authentication with refresh token rotation.

CERTIFICATIONS
- AWS Certified Cloud Practitioner (2025)
- Meta Front-End Developer Specialization (Coursera, 2024)

ACHIEVEMENTS
- Solved 300+ algorithmic problems on LeetCode with 1850 rating
- Finalist in National Smart Campus Hackathon 2024

LANGUAGES
English, Hindi, Gujarati
`;

    const extracted = parseResumeText(sampleResumeText);
    assert(extracted.personalInfo.name === 'HARDIK JETHAVA', `Extracted Name: ${extracted.personalInfo.name}`);
    assert(extracted.personalInfo.email === 'hardik.jethava@example.com', `Extracted Email: ${extracted.personalInfo.email}`);
    assert(extracted.personalInfo.phone === '+91 9876543210', `Extracted Phone: ${extracted.personalInfo.phone}`);
    assert(extracted.personalInfo.github.includes('github.com'), `Extracted GitHub: ${extracted.personalInfo.github}`);
    assert(extracted.personalInfo.linkedin.includes('linkedin.com'), `Extracted LinkedIn: ${extracted.personalInfo.linkedin}`);
    assert(extracted.education.length >= 2, `Extracted Education items: ${extracted.education.length}`);
    assert(extracted.skills.length >= 10, `Extracted Skills count: ${extracted.skills.length}`);
    assert(extracted.projects.length >= 2, `Extracted Projects count: ${extracted.projects.length}`);
    assert(extracted.experience.length >= 1, `Extracted Experience: ${extracted.experience.length}`);
    assert(extracted.certificates.length >= 1, `Extracted Certificates: ${extracted.certificates.length}`);
    assert(extracted.achievements.length >= 1, `Extracted Achievements: ${extracted.achievements.length}`);

    // 3. Test ATS Analyzer Engine
    const analysis = analyzeResume(extracted, sampleResumeText);
    assert(analysis.atsScore >= 80, `Calculated ATS Score is >= 80 (got ${analysis.atsScore}/100)`);
    assert(analysis.atsGrade === 'Good' || analysis.atsGrade === 'Excellent', `ATS Grade is ${analysis.atsGrade}`);
    assert(analysis.placementReadiness >= 75, `Placement Readiness is ${analysis.placementReadiness}%`);
    assert(analysis.strengths.length >= 3, `Identified ${analysis.strengths.length} strengths`);
    assert(analysis.categoryScores.skills.score >= 15, `Skills category score: ${analysis.categoryScores.skills.score}/20`);
    assert(analysis.categoryScores.contact.score >= 8, `Contact category score: ${analysis.categoryScores.contact.score}/10`);

    // 4. Test Scan Upload API with FormData simulation
    const formBlob = new Blob([sampleResumeText], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('resume', formBlob, 'Hardik_Jethava_Resume.pdf');

    const scanRes = await fetch('http://localhost:5000/api/resumes/scan', {
      method: 'POST',
      headers: headersA,
      body: formData
    }).then(r => r.json());

    assert(scanRes.success === true, 'POST /api/resumes/scan succeeded');
    const scan1Id = scanRes.data._id;
    assert(scanRes.data.atsScore >= 75, `Saved scan ATS Score: ${scanRes.data.atsScore}`);

    // 5. Test GET /api/resumes/scans (History API)
    const historyRes = await fetch('http://localhost:5000/api/resumes/scans', {
      headers: headersA
    }).then(r => r.json());

    assert(historyRes.success === true && historyRes.data.length >= 1, `Scan history contains ${historyRes.data?.length} records`);

    // 6. Test GET /api/resumes/scans/:scanId
    const detailRes = await fetch(`http://localhost:5000/api/resumes/scans/${scan1Id}`, {
      headers: headersA
    }).then(r => r.json());

    assert(detailRes.success === true && detailRes.data._id === scan1Id, 'GET /api/resumes/scans/:scanId retrieved exact scan');

    // 7. Upload a Second Scan (Improved version with more keywords) to test Score Improvement
    const secondResumeText = sampleResumeText + '\nKUBERNETES, GRAPHQL, CI/CD, SYSTEM DESIGN, CYBERSECURITY\nCERTIFIED KUBERNETES ADMINISTRATOR';
    const formBlob2 = new Blob([secondResumeText], { type: 'application/pdf' });
    const formData2 = new FormData();
    formData2.append('resume', formBlob2, 'Hardik_Jethava_Resume_v2.pdf');

    const scan2Res = await fetch('http://localhost:5000/api/resumes/scan', {
      method: 'POST',
      headers: headersA,
      body: formData2
    }).then(r => r.json());

    assert(scan2Res.success === true, 'POST /api/resumes/scan for version 2 succeeded');
    const scan2Id = scan2Res.data._id;

    // 8. Test POST /api/resumes/scans/compare
    const compareRes = await fetch('http://localhost:5000/api/resumes/scans/compare', {
      method: 'POST',
      headers: { ...headersA, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId1: scan1Id, scanId2: scan2Id })
    }).then(r => r.json());

    assert(compareRes.success === true, 'POST /api/resumes/scans/compare succeeded');
    assert(compareRes.data.comparison !== undefined, 'Comparison delta returned successfully');

    // 9. Test AI Review API
    const aiRes = await fetch(`http://localhost:5000/api/resumes/scans/${scan1Id}/ai-review`, {
      method: 'POST',
      headers: headersA
    }).then(r => r.json());

    assert(aiRes.success === true && aiRes.data.summarySuggestions?.length > 0, 'POST /api/resumes/scans/:scanId/ai-review succeeded');

    // 10. Test Student Data Isolation (Student B cannot access Student A's scan)
    const isolationRes = await fetch(`http://localhost:5000/api/resumes/scans/${scan1Id}`, {
      headers: headersB
    }).then(r => r.json());

    assert(isolationRes.success === false, 'Security: Student B cannot access Student A scan (returned 404/403)');

    // 11. Test GET /api/resumes/latest
    const latestRes = await fetch('http://localhost:5000/api/resumes/latest', {
      headers: headersA
    }).then(r => r.json());

    assert(latestRes.success === true && latestRes.data.lastScan !== null, 'GET /api/resumes/latest retrieved latest scan for student dashboard');

    console.log(`\n========================================`);
    console.log(`TOTAL RESUME TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
}

runResumeTests();
