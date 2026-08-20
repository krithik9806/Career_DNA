import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generates an ordered, deeply personalized career learning roadmap based on student's full profile setup.
 */
export const generateCareerRoadmap = async (studentId, targetRole) => {
  // 1. Fetch complete student profile setup
  let studentProfile = null;
  try {
    const { data } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();
    studentProfile = data;
  } catch (e) {}

  const studentName = studentProfile?.name || 'Student';
  
  // Parse target roles (support up to 3 domains)
  let rolesArray = [];
  if (Array.isArray(studentProfile?.target_roles) && studentProfile.target_roles.length > 0) {
    rolesArray = studentProfile.target_roles.slice(0, 3);
  } else if (targetRole) {
    rolesArray = targetRole.split(',').map(r => r.trim()).filter(Boolean).slice(0, 3);
  } else if (studentProfile?.target_role) {
    rolesArray = studentProfile.target_role.split(',').map(r => r.trim()).filter(Boolean).slice(0, 3);
  } else {
    rolesArray = ['Full-Stack Web Developer'];
  }

  const roleString = rolesArray.join(', ');
  const placementStage = studentProfile?.placement_status || 'Looking for Entry Level / Internship Roles';
  const targetCompanies = studentProfile?.target_companies || 'Product-based Companies / Tech Startups';
  const targetCtc = studentProfile?.target_ctc || '6-12 LPA';
  const workType = studentProfile?.preferred_work_type || 'Hybrid / Remote';
  const bio = studentProfile?.career_bio || 'Aspiring software developer eager to build production applications.';
  
  const connectedProfiles = [
    studentProfile?.github_url ? 'GitHub' : null,
    studentProfile?.linkedin_url ? 'LinkedIn' : null,
    studentProfile?.leetcode_url ? 'LeetCode' : null,
    studentProfile?.portfolio_url ? 'Portfolio' : null
  ].filter(Boolean).join(', ') || 'None connected yet';

  // 2. Fetch student's verified skills from skill graph
  let currentSkillNames = new Set(['javascript', 'react', 'git']);
  try {
    const { data: studentSkills } = await supabaseAdmin
      .from('skill_graph')
      .select('skill_name')
      .eq('student_id', studentId);
    if (studentSkills && studentSkills.length > 0) {
      currentSkillNames = new Set(studentSkills.map(s => s.skill_name.toLowerCase()));
    }
  } catch (e) {}

  // 3. Helper to format recommended learning resources
  const getCoursesForSkill = (skillName) => {
    return [
      {
        course_title: `${skillName} Mastery & Project Guide`,
        provider: 'Career DNA Curated Resource',
        course_url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' tutorial documentation project')}`,
        skills_covered_json: [skillName]
      },
      {
        course_title: `FreeCodeCamp / Coursera: ${skillName}`,
        provider: 'FreeCodeCamp',
        course_url: `https://www.coursera.org/search?query=${encodeURIComponent(skillName)}`,
        skills_covered_json: [skillName]
      }
    ];
  };

  // 4. Generate personalized roadmap using Gemini LLM
  let sequencedItems = [];
  const activeKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '';

  if (activeKey) {
    try {
      const prompt = `You are an elite AI Career Architect for Career DNA.
Generate a 100% UNIQUE, HIGHLY CUSTOMIZED, and CREATIVE 6 to 8 step career development roadmap for this student.

=== STUDENT PROFILE SETUP ===
- Student Name: ${studentName}
- Target Career Domains (Selected Up to 3): [${rolesArray.join(' | ')}]
- Placement Stage: ${placementStage}
- Target Companies: ${targetCompanies}
- Target Salary / CTC Goal: ${targetCtc}
- Preferred Work Model: ${workType}
- Connected Profiles: ${connectedProfiles}
- Career Ambition Bio: "${bio}"
- Current Verified Student Skills in Skill Graph: [${Array.from(currentSkillNames).join(', ')}]
- Unique Prompt Run Token: ${Date.now()}-${Math.random()}

=== INSTRUCTIONS ===
1. Analyze the student's unique combination of target domains [${rolesArray.join(', ')}], their current skills, and their salary/company ambitions.
2. DO NOT use generic static steps. Create 6 to 8 fresh, highly specific, domain-integrated milestones designed specifically for cracking interviews at ${targetCompanies} for ${rolesArray.join(' & ')} roles at ${targetCtc}.
3. If multiple domains are selected, cross-pollinate skills (e.g. AI + Full-Stack -> Building AI-Powered Next.js Web Apps with Vector Search; Backend + DevOps -> Building Containerized Microservices with CI/CD).
4. For EACH roadmap item, output:
   - "priority_rank": number (1, 2, 3...)
   - "skill_name": string (vibrant, highly specific topic name)
   - "reasoning_text": string (2-3 sentences explaining EXACTLY why this step is vital for ${studentName}'s specific profile, target domains, and ${targetCtc} salary goal)
   - "estimated_hours": string (e.g. "12-18 hours")
   - "recommended_action": string (a specific, non-generic project idea to build for their portfolio)

Return ONLY a strict JSON array of objects with NO markdown formatting, NO backticks:
[
  {
    "priority_rank": 1,
    "skill_name": "...",
    "reasoning_text": "...",
    "estimated_hours": "...",
    "recommended_action": "..."
  }
]`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${activeKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85 }
        })
      });
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sequencedItems = parsed;
        }
      }
    } catch (llmErr) {
      console.warn('[LLM ROADMAP NOTICE]', llmErr.message);
    }
  }

  // Fallback domain-aware generator if LLM API is unavailable
  if (sequencedItems.length === 0) {
    const DOMAIN_DYNAMIC_MAP = {
      'AI / Machine Learning Engineer': [
        { skill_name: 'PyTorch Deep Learning & Neural Nets', reasoning_text: `Essential for ${studentName} to build custom models for ${targetCompanies} AI roles.`, estimated_hours: '25 hours', recommended_action: 'Train a PyTorch CNN classifier and log metrics.' },
        { skill_name: 'FastAPI High-Performance Inference APIs', reasoning_text: `Deploys Python models as low-latency microservices for ${targetCtc} production environments.`, estimated_hours: '15 hours', recommended_action: 'Serve an asynchronous LLM model via FastAPI & Docker.' },
        { skill_name: 'Vector DBs (Qdrant/Pinecone) & RAG Embeddings', reasoning_text: `Enables ${studentName} to build grounded RAG systems for modern AI applications.`, estimated_hours: '20 hours', recommended_action: 'Build a document semantic search pipeline with Qdrant.' }
      ],
      'Data Scientist': [
        { skill_name: 'Pandas & BigQuery SQL Data Engineering', reasoning_text: `Critical data wrangling foundation for ${studentName} targeting ${targetCompanies}.`, estimated_hours: '20 hours', recommended_action: 'Query 1M+ rows in BigQuery and visualize insights.' },
        { skill_name: 'Statistical Modeling & Machine Learning', reasoning_text: `Validates business hypotheses and ML models for ${targetCtc} data roles.`, estimated_hours: '25 hours', recommended_action: 'Build a predictive classification model using Scikit-Learn.' }
      ],
      'DevOps & Cloud Engineer': [
        { skill_name: 'Kubernetes Cluster Orchestration & Helm', reasoning_text: `Automates cloud container deployments for ${studentName} at ${targetCompanies}.`, estimated_hours: '30 hours', recommended_action: 'Deploy a multi-pod web service on a Minikube K8s cluster.' },
        { skill_name: 'Terraform Infrastructure as Code (IaC)', reasoning_text: `Declaratively provisions AWS/GCP resources required for ${targetCtc} cloud engineers.`, estimated_hours: '22 hours', recommended_action: 'Provision VPC networks and EC2 instances via Terraform scripts.' }
      ],
      'Cybersecurity Specialist': [
        { skill_name: 'Network Threat Detection & Wireshark', reasoning_text: `Inspects packet captures and identifies malicious traffic patterns for security teams.`, estimated_hours: '20 hours', recommended_action: 'Analyze PCAP files to identify SQL injection and port scans.' },
        { skill_name: 'SIEM Log Monitoring & Threat Hunting', reasoning_text: `Monitors enterprise event logs to respond to security incidents.`, estimated_hours: '25 hours', recommended_action: 'Configure log dashboards for brute-force detection.' }
      ],
      'Frontend Engineer': [
        { skill_name: 'Next.js 14 App Router & Server Components', reasoning_text: `Delivers ultra-fast SSR applications expected by top product teams at ${targetCompanies}.`, estimated_hours: '20 hours', recommended_action: 'Build a Next.js server-rendered dashboard with Tailwind CSS.' },
        { skill_name: 'Core Web Vitals & Performance Optimization', reasoning_text: `Optimizes LCP and INP metrics required for high-traffic web platforms.`, estimated_hours: '15 hours', recommended_action: 'Audit Lighthouse scores and lazy load dynamic components.' }
      ],
      'Backend Engineer': [
        { skill_name: 'Node.js & Redis High-Speed Caching', reasoning_text: `Implements caching layers to support thousands of concurrent requests for ${targetCtc} roles.`, estimated_hours: '20 hours', recommended_action: 'Build a Redis-backed rate limiter for Express APIs.' },
        { skill_name: 'Microservices & Message Queues (Kafka/RabbitMQ)', reasoning_text: `Decouples distributed services for enterprise scale at ${targetCompanies}.`, estimated_hours: '28 hours', recommended_action: 'Implement an event-driven pub/sub queue between Node backend services.' }
      ]
    };

    let generatedFallback = [];
    rolesArray.forEach(roleKey => {
      const items = DOMAIN_DYNAMIC_MAP[roleKey] || [
        { skill_name: `Advanced ${roleKey} Architecture`, reasoning_text: `Critical core competency for ${studentName} targeting ${roleKey} roles at ${targetCompanies}.`, estimated_hours: '20 hours', recommended_action: `Build a production project demonstrating ${roleKey} principles.` }
      ];
      generatedFallback = [...generatedFallback, ...items];
    });

    // Add general interview DSA item
    generatedFallback.push({
      skill_name: 'Data Structures & System Interview Practice',
      reasoning_text: `Cracking technical rounds at ${targetCompanies} for ${targetCtc} positions requires problem-solving agility.`,
      estimated_hours: '25 hours',
      recommended_action: 'Solve 30 curated interview patterns on LeetCode.'
    });

    sequencedItems = generatedFallback.map((item, idx) => ({
      priority_rank: idx + 1,
      skill_name: item.skill_name,
      reasoning_text: item.reasoning_text,
      estimated_hours: item.estimated_hours,
      recommended_action: item.recommended_action
    }));
  }

  // 5. Formulate structured response items
  const roadmapRowsToInsert = sequencedItems.map((item, idx) => ({
    id: `rm-item-${studentId}-${idx + 1}`,
    student_id: studentId,
    target_role: roleString,
    skill_name: item.skill_name,
    priority_rank: item.priority_rank || idx + 1,
    reasoning_text: item.reasoning_text,
    estimated_hours: item.estimated_hours || '15-20 hours',
    recommended_action: item.recommended_action || 'Complete a hands-on project module.',
    status: 'pending',
    recommended_courses: getCoursesForSkill(item.skill_name)
  }));

  // Try saving to DB if available
  try {
    await supabaseAdmin.from('roadmap_items').delete().eq('student_id', studentId);
    await supabaseAdmin.from('roadmap_items').insert(
      roadmapRowsToInsert.map(i => ({
        student_id: i.student_id,
        target_role: i.target_role,
        skill_name: i.skill_name,
        priority_rank: i.priority_rank,
        reasoning_text: i.reasoning_text,
        status: i.status
      }))
    );
  } catch (e) {}

  return {
    target_role: roleString,
    student_name: studentName,
    placement_status: placementStage,
    target_companies: targetCompanies,
    target_ctc: targetCtc,
    readiness_percentage: 25,
    roadmap_items: roadmapRowsToInsert,
    completion_percentage: 0
  };
};
