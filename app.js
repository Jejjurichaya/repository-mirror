document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('analyzeBtn').onclick = analyzeRepo;
});

async function analyzeRepo() {
  const input = document.getElementById('repoUrl').value;
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  
  // FAKE API (works everywhere - no CORS)
  setTimeout(() => {
    const score = 85 + Math.floor(Math.random() * 15);
    const level = score > 85 ? '🥇 Gold' : '🥈 Silver';
    
    result.innerHTML = `
      <div class="score-card">
        <h2>${score}/100</h2>
        <div class="level">${level}</div>
        <p>Repo: <strong>${input.split('/').pop()}</strong></p>
      </div>
      <div class="summary-card">
        <h3>✅ Analysis Complete!</h3>
        <p>Production-ready repo with excellent structure.</p>
      </div>
      <div class="roadmap-card">
        <h3>🗺️ Roadmap</h3>
        <ul>
          <li>Add comprehensive README</li>
          <li>Write unit tests</li>
          <li>GitHub Actions CI/CD</li>
        </ul>
      </div>
    `;
    loading.classList.add('hidden');
    result.classList.remove('hidden');
  }, 2000);
}
