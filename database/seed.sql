-- Career DNA - Reference Data Seeding Script
-- Seeds reference occupations and curated courses

-- Reference Occupations (O*NET & Curated)
INSERT INTO public.reference_occupations (role_name, required_skills_json, source)
VALUES
(
  'Full-Stack Web Developer',
  '["JavaScript", "TypeScript", "React", "Node.js", "Express", "HTML/CSS", "PostgreSQL", "REST APIs", "Git", "Docker"]'::jsonb,
  'manual'
),
(
  'AI / Machine Learning Engineer',
  '["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning", "SQL", "Data Pipelines", "REST APIs", "Git"]'::jsonb,
  'manual'
),
(
  'Data Scientist',
  '["Python", "R", "SQL", "Pandas", "NumPy", "Data Visualization", "Statistics", "Machine Learning", "PowerBI", "Communication"]'::jsonb,
  'manual'
),
(
  'DevOps & Cloud Engineer',
  '["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Python", "Bash", "Networking", "Git"]'::jsonb,
  'manual'
),
(
  'Frontend Engineer',
  '["JavaScript", "TypeScript", "React", "Next.js", "HTML5", "CSS3/Tailwind", "State Management", "Web Performance", "Git", "REST APIs"]'::jsonb,
  'manual'
),
(
  'Backend Engineer',
  '["Node.js", "Python", "Java", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL", "Microservices", "System Design", "Docker"]'::jsonb,
  'manual'
)
ON CONFLICT (role_name) DO UPDATE 
SET required_skills_json = EXCLUDED.required_skills_json;

-- Reference Courses
INSERT INTO public.reference_courses (title, provider, skills_covered_json, url)
VALUES
(
  'Complete React Developer (with Redux, Hooks, GraphQL)',
  'Coursera / Udemy',
  '["React", "JavaScript", "State Management", "HTML/CSS"]'::jsonb,
  'https://www.coursera.org/learn/react-basics'
),
(
  'Node.js, Express, MongoDB & More: The Complete Bootcamp',
  'freeCodeCamp / Udemy',
  '["Node.js", "Express", "REST APIs", "PostgreSQL", "MongoDB"]'::jsonb,
  'https://freecodecamp.org/learn/back-end-development-and-apis/'
),
(
  'Deep Learning Specialization by Andrew Ng',
  'Coursera / DeepLearning.AI',
  '["Python", "PyTorch", "TensorFlow", "Deep Learning", "Machine Learning"]'::jsonb,
  'https://www.coursera.org/specializations/deep-learning'
),
(
  'Docker and Kubernetes: The Complete Guide',
  'Udemy / KodeKloud',
  '["Docker", "Kubernetes", "DevOps", "CI/CD"]'::jsonb,
  'https://kubernetes.io/docs/tutorials/kubernetes-basics/'
),
(
  'SQL for Data Science',
  'Coursera / Khan Academy',
  '["SQL", "PostgreSQL", "Data Pipelines", "Database Design"]'::jsonb,
  'https://www.coursera.org/learn/sql-for-data-science'
)
ON CONFLICT DO NOTHING;
