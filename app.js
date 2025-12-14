document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('analyzeBtn').onclick = analyzeRepo;
});

async function analyzeRepo() {
  const input = document.getElementById('repoUrl').value.trim();
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  // Extract owner/repo from URL
  const match = input.match(/github\.com[\/:]([^\/]+)\/([^\/]+)/);
  if (!match) {
    alert('Enter valid GitHub URL like: https://github.com/facebook/react');
    return;
  }
  
  const [, owner, repoName] = match;
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  
  try {
    // DIRECT GitHub API - Works on GitHub Pages!
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        'User-Agent': 'Repository-Analyzer-Hackathon',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) throw new Error('Repo not found');
    
    const repo = await response.json();
    
    // PROFESSIONAL SCORING (Real data!)
    const score = Math.min(100, 
      Math.min(repo.stargazers_count / 2000, 25) +      // Stars (25)
      Math.min(repo.forks_count / 1000, 20) +           // Forks (20)  
      (repo.description ? 15 : 0) +                      // Description (15)
      (repo.license ? 15 : 0) +                          // License (15)
      (repo.open_issues < 50 ? 10 : 5) +                // Issues (10)
      (repo.topics && repo.topics.length ? 10 : 0) +    // Topics (10)
      5                                                   // Base score
    );
    
    const level = score >= 85 ? '🥇 Gold' : score >= 65 ? '🥈 Silver' : '🥉 Bronze';
    
    result.innerHTML = `
      <div class="score-card">
        <h2>${Math.round(score)}/100</h2>
        <div class="level">${level}</div>
        <p><strong>${repo.full_name}</strong></p>
        <p>⭐ ${repo.stargazers_count.toLocaleString()} | 🍴 ${repo.forks_count.toLocaleString()}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric">📝 ${repo.description ? '✅ Has' : '❌ Add'} Description</div>
        <div class="metric">⚖️ ${repo.license?.name || 'None'}</div>
        <div class="metric">🐛 ${repo.open_issues} Issues</div>
        <div class="metric">🏷️ ${repo.topics?.length || 0} Topics</div>
      </div>
      
      <div class="roadmap-card">
        <h3>🗺️ Improvement Roadmap</h3>
        <ul>
          ${!repo.description ? '<li>Add compelling project description</li>' : ''}
          ${!repo.license ? '<li>Add MIT/Apache license</li>' : ''}
          ${repo.open_issues > 10 ? '<li>Resolve open issues</li>' : ''}
          ${(!repo.topics || repo.topics.length === 0) ? '<li>Add GitHub topics</li>' : ''}
          <li>Add screenshots/GIFs to README</li>
          <li>Enable GitHub Pages demo</li>
        </ul>
      </div>
    `;
    
  } catch (error) {
    result.innerHTML = `
      <div class="error-card">
        <h3>❌ Cannot Analyze</h3>
        <p>Private repo? Try public repos:<br>
        • https://github.com/facebook/react<br>
        • https://github.com/torvalds/linux<br>
        • https://github.com/octocat/Hello-World
        </p>
      </div>
    `;
  }
  
  loading.classList.add('hidden');
  result.classList.remove('hidden');
}
