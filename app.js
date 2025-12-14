document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('analyzeBtn').onclick = analyzeRepo;
});

async function analyzeRepo() {
  const url = document.getElementById('repoUrl').value;
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  
  try {
    // Fetch main repo info
    const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const [, owner, repo] = repoMatch;
    
    const [repoRes, commitsRes, languagesRes, contentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contents`)
    ]);
    
    const repoData = await repoRes.json();
    const commits = await commitsRes.json();
    const languages = await languagesRes.json();
    const files = await contentsRes.json();
    
    // PROFESSIONAL SCORING (100 points total)
    const score = calculateScore(repoData, commits, languages, files);
    const level = getLevel(score);
    
    displayResults(score, level, repoData, commits, languages, files);
    
  } catch (e) {
    result.innerHTML = `<div class="error-card">Invalid repository URL</div>`;
  }
  
  loading.classList.add('hidden');
  result.classList.remove('hidden');
}

function calculateScore(repo, commits, languages, files) {
  let score = 0;
  
  // Documentation (20 pts)
  score += repo.description ? 10 : 0;
  score += repo.homepage ? 10 : 0;
  
  // Popularity (15 pts)
  score += Math.min(repo.stargazers_count / 50, 15);
  
  // Activity (20 pts)
  const commitCount = commits.length;
  score += commitCount > 50 ? 15 : commitCount > 10 ? 10 : 5;
  
  // Languages (10 pts)
  score += Object.keys(languages).length <= 2 ? 10 : 5;
  
  // Structure (15 pts)
  const hasTests = files.some(f => f.name.match(/test|spec/i));
  const hasReadme = files.some(f => f.name.toLowerCase() === 'readme.md');
  score += hasReadme ? 10 : 0;
  score += hasTests ? 5 : 0;
  
  // License & Professionalism (10 pts)
  score += repo.license ? 8 : 0;
  score += repo.topics && repo.topics.length > 0 ? 2 : 0;
  
  // Issues & Maintainability (10 pts)
  score += repo.open_issues < 20 ? 10 : repo.open_issues < 100 ? 5 : 0;
  
  return Math.round(Math.min(score, 100));
}

function getLevel(score) {
  if (score >= 85) return '🥇 Gold (Production Ready)';
  if (score >= 70) return '🥈 Silver (Very Good)';
  if (score >= 55) return '🥉 Bronze (Good Start)';
  return 'Needs Improvement';
}

function displayResults(score, level, repo, commits, languages, files) {
  const hasReadme = files.some(f => f.name.toLowerCase() === 'readme.md');
  const hasTests = files.some(f => f.name.match(/test|spec/i));
  
  document.getElementById('result').innerHTML = `
    <div class="score-card">
      <h2>${score}/100</h2>
      <div class="level">${level}</div>
      <p><strong>${repo.full_name}</strong></p>
    </div>
    
    <div class="metrics-grid">
      <div class="metric">⭐ ${repo.stargazers_count.toLocaleString()}</div>
      <div class="metric">📁 ${files.length} files</div>
      <div class="metric">💾 ${Object.keys(languages).length} languages</div>
      <div class="metric">🔄 ${commits.length} commits</div>
    </div>
    
    <div class="summary-card">
      <h3>📊 Breakdown</h3>
      <p>${repo.description || 'No description'}</p>
      <p><strong>Tests:</strong> ${hasTests ? '✅ Yes' : '❌ No'} | 
         <strong>README:</strong> ${hasReadme ? '✅ Yes' : '❌ No'} |
         <strong>License:</strong> ${repo.license?.name || 'None'}</p>
    </div>
    
    <div class="roadmap-card">
      <h3>🗺️ Actionable Improvements</h3>
      <ul>
        ${!repo.description ? '<li>Add project description</li>' : ''}
        ${!hasReadme ? '<li>Create comprehensive README.md</li>' : ''}
        ${!hasTests ? '<li>Add test files (tests/, __tests__/)</li>' : ''}
        ${!repo.license ? '<li>Add MIT license</li>' : ''}
        ${Object.keys(languages).length > 3 ? '<li>Focus on 1-2 languages</li>' : ''}
        <li>Add GitHub topics & screenshots</li>
      </ul>
    </div>
  `;
}
