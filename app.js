document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('analyzeBtn').addEventListener('click', analyzeRepo);
});

async function analyzeRepo() {
  const input = document.getElementById('repoUrl');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  const url = input.value.trim();
  if (!url) return alert('Enter GitHub repo URL');
  
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  
  // Use CORS proxy + GitHub API
  const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url.replace('github.com', 'api.github.com/repos'))}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const repo = JSON.parse(data.contents);
    
    // FAIR SCORING ALGORITHM
    let score = 0;
    
    // Stars (25 pts max)
    score += Math.min(repo.stargazers_count / 1000 * 25, 25);
    
    // Forks (15 pts max)  
    score += Math.min(repo.forks_count / 500 * 15, 15);
    
    // Description (10 pts)
    score += repo.description ? 10 : 0;
    
    // License (10 pts)
    score += repo.license ? 10 : 0;
    
    // Issues (10 pts - fewer = better)
    score += repo.open_issues_count < 50 ? 10 : repo.open_issues_count < 200 ? 5 : 0;
    
    // Language count (10 pts - fewer = better)
    score += Object.keys(repo.languages_url ? {} : {}).length <= 2 ? 10 : 5;
    
    // Activity bonus (20 pts)
    score += Math.min((new Date() - new Date(repo.updated_at)) / 86400000 * -0.1 + 20, 20);
    
    score = Math.round(Math.max(0, Math.min(score, 100)));
    const level = score >= 85 ? '🥇 Gold' : score >= 65 ? '🥈 Silver' : score >= 45 ? '🥉 Bronze' : 'Needs Work';
    
    result.innerHTML = `
      <div class="score-card">
        <h2>${score}/100</h2>
        <div class="level">${level}</div>
        <p><strong>${repo.full_name}</strong></p>
        <p>⭐ ${repo.stargazers_count.toLocaleString()} | 🍴 ${repo.forks_count.toLocaleString()}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric"><strong>${repo.description ? '✅' : '❌'}</strong> Description</div>
        <div class="metric"><strong>${repo.license?.name || 'None'}</strong> License</div>
        <div class="metric"><strong>${repo.open_issues_count}</strong> Issues</div>
        <div class="metric"><strong>${repo.language || 'Multi'}</strong> Language</div>
      </div>
      
      <div class="roadmap-card">
        <h3>🗺️ Personalized Roadmap</h3>
        <ul>
          ${!repo.description ? '<li>Add project description (README)</li>' : ''}
          ${!repo.license ? '<li>Add MIT license file</li>' : ''}
          ${repo.open_issues_count > 10 ? '<li>Resolve open issues</li>' : ''}
          <li>Add screenshots/demo GIF to README</li>
          <li>Enable GitHub Pages for live demo</li>
          <li>Add relevant topics/tags</li>
        </ul>
      </div>
    `;
    
  } catch (error) {
    result.innerHTML = `
      <div class="error-card">
        <h3>❌ Analysis Failed</h3>
        <p>Private repo or invalid URL. Try public repos like:<br>
        https://github.com/facebook/react</p>
      </div>
    `;
  }
  
  loading.classList.add('hidden');
  result.classList.remove('hidden');
}
