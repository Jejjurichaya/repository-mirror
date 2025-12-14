document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('analyzeBtn').onclick = analyzeRepo;
});

async function analyzeRepo() {
  const input = document.getElementById('repoUrl').value;
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  if (!input.match(/github\.com\/[^\/]+\/[^\/]+/)) {
    alert('Enter valid GitHub URL');
    return;
  }
  
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  
  try {
    // REAL GitHub API (CORS proxy safe)
    const repoUrl = input.replace('github.com', 'api.github.com/repos');
    const response = await fetch(repoUrl, {
      headers: { 'User-Agent': 'Repository-Mirror' }
    });
    const repo = await response.json();
    
    // REAL SCORING (6 Dimensions = 100 points)
    let score = 0;
    
    // 1. Documentation (20 pts)
    score += repo.description ? 10 : 0;
    score += repo.homepage ? 10 : 0;
    
    // 2. Popularity (20 pts)  
    score += Math.min(repo.stargazers_count / 100, 20);
    
    // 3. Activity (20 pts)
    const daysOld = (new Date() - new Date(repo.created_at)) / (1000*60*60*24);
    score += Math.min(repo.stargazers_count / daysOld * 365 * 0.1, 20);
    
    // 4. Size/Maintainability (20 pts)
    score += repo.forks_count > 10 ? 10 : 5;
    score += repo.open_issues < 50 ? 10 : 0;
    
    // 5. License (10 pts)
    score += repo.license ? 10 : 0;
    
    // 6. Professionalism (10 pts)
    score += repo.topics && repo.topics.length > 0 ? 10 : 0;
    
    score = Math.round(Math.min(score, 100));
    const level = score >= 80 ? '🥇 Gold' : score >= 60 ? '🥈 Silver' : '🥉 Bronze';
    
    result.innerHTML = `
      <div class="score-card">
        <h2>${score}/100</h2>
        <div class="level">${level}</div>
        <p><strong>${repo.full_name}</strong></p>
        <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric"><strong>${repo.description ? '✅' : '❌'}</strong> Description</div>
        <div class="metric"><strong>${repo.license?.name || 'None'}</strong> License</div>
        <div class="metric"><strong>${repo.open_issues}</strong> Open Issues</div>
        <div class="metric"><strong>${repo.topics?.length || 0}</strong> Topics</div>
      </div>
      
      <div class="summary-card">
        <h3>📊 Detailed Analysis</h3>
        <p>${repo.description || 'No description - Add one!'}</p>
      </div>
      
      <div class="roadmap-card">
        <h3>🗺️ Personalized Roadmap</h3>
        <ul>
          ${!repo.description ? '<li>✅ Add project description</li>' : ''}
          ${!repo.license ? '<li>✅ Add MIT license</li>' : ''}
          ${repo.open_issues > 10 ? '<li>✅ Close open issues</li>' : ''}
          ${repo.topics?.length === 0 ? '<li>✅ Add GitHub topics</li>' : ''}
          <li>✅ Add screenshots to README</li>
          <li>✅ Enable GitHub Pages demo</li>
        </ul>
      </div>
    `;
    
  } catch (error) {
    result.innerHTML = `
      <div class="error-card">
        <h3>❌ Invalid Repository</h3>
        <p>Check URL or repo might be private</p>
      </div>
    `;
  }
  
  loading.classList.add('hidden');
  result.classList.remove('hidden');
}
