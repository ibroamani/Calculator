function calculateScore() {
  let posts = parseFloat(document.getElementById("posts").value);
  let smartFollowers = parseFloat(document.getElementById("smartFollowers").value);
  let normalFollowers = parseFloat(document.getElementById("normalFollowers").value);
  let impressions = parseFloat(document.getElementById("impressions").value);

  // Default engagement assumptions
  let likes = impressions * 0.01;
  let retweets = impressions * 0.005;
  let quotes = impressions * 0.002;
  let followers = smartFollowers + normalFollowers;

  // Core formula logic
  let ER_percent = ((likes + retweets + quotes) / Math.max(impressions, 1)) * 100;
  let SRM = Math.min(1, impressions / 100000);
  let SF = Math.min(Math.log10(smartFollowers + 1), 3.0);
  let IMP = Math.sqrt(impressions);
  let qW = 4 + 2 * SRM;
  let ENG = likes + 3 * retweets + qW * quotes;
  let EngObs = Math.max(ENG, (ER_percent / 100) * impressions);
  let ER_cap = 0.01 + 0.04 * SRM;
  let EffEng = Math.min(EngObs, impressions * ER_cap);
  let Clamp = EngObs !== 0 ? EffEng / EngObs : 0;
  let smart_engagement = ENG * (smartFollowers / Math.max(followers, 1));
  let SENG = Math.min(smart_engagement, 0.5 * EffEng);
  let QE = Math.min(Math.log(1 + impressions / Math.max(followers, 1)), 2.0) * SRM;
  let postMult = 1 + 0.02 * Math.min(posts, 20);
  let erMult = 0.9 + 2 * Math.min(ER_percent / 100, 0.05);
  erMult = Math.min(erMult, 1.0);

  // Disqualification guard
  if (ER_percent > 20) {
    document.getElementById("result").innerText = "Final Score: 0 (Disqualified)";
    return;
  }

  // Additional penalty
  let penalty = 1.0;
  if (ER_percent > 10 && impressions < 50000) penalty = 0.3;

  // Final score computation
  let engageBlock = (ENG * 0.7 * Clamp + SENG * 150) * Math.pow(SRM, 1.5);
  let baseScore = SF * 500 + IMP * 10 + engageBlock + QE * 120;
  let finalScore = baseScore * erMult * postMult * penalty;

  document.getElementById("result").innerText = "Final Score: " + finalScore.toFixed(2);
}