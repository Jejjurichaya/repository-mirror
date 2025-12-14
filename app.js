async function analyzeRepo() {
  const url = document.getElementById('repoUrl').value.trim();
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  if (!url) {
    alert('Enter a GitHub repository URL');
    return;
  }

  // Validate GitHub URL
  const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!repoMatch) {
    alert('Invalid GitHub URL format');
    return;
  }

  const [, owner, repo] = repoMatch;
  loading.classList.remove('hidden');
  result.classList.add('hidden');

  try {
    // Fetch repo data
    const repoData = await fetchRepoData(owner, repo);
    const analysis = evaluateRepository(repoData);
    
    displayResult(analysis, repoData);
  } catch (error) {
    result.innerHTML = `
      <div class="error-card">
        <h3>❌ Analysis Failed</h3>
        <p>Could not fetch repository data. Make sure it's public.</p>
      </div>
    `;
  } finally {
    loading.classList.add('hidden');
    result.classList.remove('hidden');
  }
}

async function fetchRepoData(owner, repo) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  const [repoRes, commitsRes, languagesRes, contentsRes] = await Promise.all([
    fetch(apiUrl),
    fetch(`${apiUrl}/commits?per_page=100`),
    fetch(`${apiUrl}/languages`),
    fetch(`${apiUrl}/contents`)
  ]);

  const repo = await repoRes.json();
  const commits = await commitsRes.json();
  const languages = await languagesRes.json();
  const files = await contentsRes.json();

  return {
    name: repo.name,
    description: repo.description || '',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    license: repo.license?.name || 'None',
    commits: commits.length,
    languages: Object.keys(languages),
    files: files.length,
    hasReadme: files.some(f => f.name.toLowerCase() === 'readme.md'),
    mainBranch: repo.default_branch,
    lastUpdated: repo.updated_at,
    hasTests: files.some(f => f.name.match(/test|spec/i))
  };
}

function evaluateRepository(data) {
  let score = 0;

  // Code Quality (25)
  score += data.languages.length <= 3 ? 10 : 5;
  score += data.description ? 8 : 0;
  score += data.hasTests ? 7 : 0;

  // Project Structure (15)
  score += data.files <= 50 ? 8 : 4;
  score += data.hasReadme ? 7 : 0;

  // Documentation (15)
  score += data.hasReadme && data.description ? 12 : data.hasReadme ? 8 : 0;

  // Version Control (15)
  score += data.commits > 20 ? 10 : data.commits > 5 ? 5 : 0;

  // Testing (15)
  score += data.hasTests ? 12 : 0;

  // Real-world relevance (15)
  score += data.stars > 5 ? 8 : data.forks > 2 ? 5 : 0;
  score += data.license !== 'None' ? 7 : 0;

  const level = score >= 75 ? '🥇 Gold (Advanced)' : 
                score >= 50 ? '🥈 Silver (Intermediate)' : 
                '🥉 Bronze (Beginner)';

  return { score: Math.min(score, 100), level, data };
}

function displayResult(analysis, data) {
  const { score, level, data: repoData } = analysis;
  
  document.getElementById('result').innerHTML = `
    <div class="score-card">
      <h2>${score}/100</h2>
      <div class="level">${level}</div>
      <p>Repository: <strong>${repoData.name}</strong></p>
    </div>

    <div class="summary-card">
      <h3>📊 Quality Summary</h3>
      <p>${generateSummary(repoData, score)}</p>
    </div>

    <div class="roadmap-card">
      <h3>🗺️ Personalized Roadmap</h3>
      <ul>${generateRoadmap(repoData)}</ul>
    </div>

    <div class="metrics-grid">
      <div class="metric">
        <strong>${repoData.commits}</strong> Commits
      </div>
      <div class="metric">
        <strong>${repoData.languages.length}</strong> Languages
      </div>
      <div class="metric">
        <strong>${repoData.files}</strong> Files
      </div>
      <div class="metric">
        <strong>${repoData.stars}</strong> Stars
      </div>
    </div>
  `;
}

function generateSummary(data, score) {
  let summary = `This repository scores ${score}/100. `;
  
  if (data.hasReadme && data.description) {
    summary += "Good documentation and clear purpose. ";
  } else {
    summary += "Add README and project description for better understanding. ";
  }
  
  if (data.commits > 20) {
    summary += "Consistent development history. ";
  } else {
    summary += "More commits will show steady progress. ";
  }
  
  if (data.hasTests) {
    summary += "Testing present - excellent for maintainability!";
  } else {
    summary += "Add tests to improve reliability.";
  }
  
  return summary;
}

function generateRoadmap(data) {
  let roadmap = '';
  
  if (!data.hasReadme) roadmap += '<li>✅ Create comprehensive README.md with setup instructions</li>';
  if (!data.description) roadmap += '<li>✅ Add clear project description</li>';
  if (!data.hasTests) roadmap += '<li>✅ Add unit tests (Jest/Pytest)</li>';
  if (data.commits < 10) roadmap += '<li>✅ Make smaller, frequent commits with clear messages</li>';
  if (data.languages.length > 3) roadmap += '<li>✅ Focus on single primary language</li>';
  if (data.license === 'None') roadmap += '<li>✅ Add open-source license (MIT recommended)</li>';
  roadmap += '<li>✅ Create demo video or screenshots</li>';
  roadmap += '<li>✅ Set up GitHub Actions for CI/CD</li>';
  
  return roadmap || '<li>🎉 Excellent repository! Consider open-sourcing for contributions.</li>';
}
