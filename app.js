// ============================================================
// Election Guide — Interactive Assistant
// ============================================================

const messagesEl = document.getElementById('messages');
const quickActionsEl = document.getElementById('quick-actions');
const userInput = document.getElementById('user-input');
const btnSend = document.getElementById('btn-send');
const btnReset = document.getElementById('btn-reset');
const chatArea = document.getElementById('chat-area');

let currentCountry = null;
let conversationState = 'welcome';

// ============================================================
// KNOWLEDGE BASE
// ============================================================
const ELECTION_DATA = {
  india: {
    name: 'India',
    flag: '🇮🇳',
    commission: 'Election Commission of India (ECI)',
    eligibility: { age: 18, citizenship: 'Indian citizen', id: 'Voter ID (EPIC), Aadhaar, Passport, etc.', residency: 'Must be a resident of the constituency' },
    votingMethod: 'Electronic Voting Machine (EVM) with VVPAT',
    steps: [
      { title: 'Voter Registration', desc: 'Register on the Electoral Roll via Form 6 online at nvsp.in or at your nearest Electoral Registration Office. You receive an EPIC (Voter ID card).' },
      { title: 'Election Announcement', desc: 'The ECI announces the election schedule, including dates for nominations, campaigning, polling, and counting. The Model Code of Conduct kicks in.' },
      { title: 'Candidate Nomination', desc: 'Candidates file nomination papers with a security deposit. Scrutiny of nominations follows, and candidates can withdraw within the allowed window.' },
      { title: 'Campaigning', desc: 'Parties and candidates campaign through rallies, advertisements, door-to-door canvassing, and social media. Campaigning stops 48 hours before polling.' },
      { title: 'Polling Day', desc: 'Voters visit their assigned polling booth, verify identity, receive a ballot slip, and cast their vote on the EVM. The VVPAT prints a slip for verification.' },
      { title: 'Counting of Votes', desc: 'EVMs are stored securely and counted on the designated date. Postal ballots are counted first, then EVM results are tallied round by round.' },
      { title: 'Result Declaration', desc: 'Results are announced constituency by constituency. The party/alliance with a majority is invited to form the government.' }
    ],
    timeline: [
      { phase: 'Notification', duration: 'Day 0', desc: 'Formal announcement of elections' },
      { phase: 'Nominations', duration: 'Day 1–7', desc: 'Filing & scrutiny of nominations' },
      { phase: 'Withdrawal', duration: 'Day 10', desc: 'Last day to withdraw candidature' },
      { phase: 'Campaigning', duration: 'Day 1–14+', desc: 'Active campaign period' },
      { phase: 'Silent Period', duration: '48 hrs before poll', desc: 'No campaigning allowed' },
      { phase: 'Polling', duration: 'Polling Day', desc: 'Voting from 7 AM to 6 PM typically' },
      { phase: 'Counting', duration: '2–3 days after', desc: 'Votes counted, results declared' }
    ],
    checklist: ['Voter ID (EPIC) or approved photo ID', 'Check your name on the Electoral Roll', 'Know your polling booth (check via Voter Helpline app)', 'Carry no electronic devices inside the booth', 'Reach before closing time (6 PM usually)'],
    tips: 'Use the Voter Helpline App or call 1950 for any election-related queries. First-time voters can register from age 17 onwards (effective from the qualifying date).'
  },
  usa: {
    name: 'United States',
    flag: '🇺🇸',
    commission: 'Federal Election Commission (FEC) & state election boards',
    eligibility: { age: 18, citizenship: 'U.S. citizen', id: 'Varies by state — some require photo ID, others accept non-photo ID or affidavit', residency: 'Must be a resident of the state where registering' },
    votingMethod: 'Paper ballots, optical scan, DRE machines, or mail-in ballots (varies by state)',
    steps: [
      { title: 'Voter Registration', desc: 'Register through your state\'s election office, online portal, DMV, or using the National Voter Registration Form. Some states offer same-day registration.' },
      { title: 'Primaries & Caucuses', desc: 'Parties select their candidates through primary elections or caucuses held at the state level. These determine who appears on the general election ballot.' },
      { title: 'National Conventions', desc: 'Each major party holds a national convention where delegates formally nominate the presidential candidate.' },
      { title: 'Campaigning', desc: 'Candidates campaign nationwide through debates, rallies, TV ads, and social media. Campaign finance is regulated by the FEC.' },
      { title: 'Election Day', desc: 'Held on the first Tuesday after the first Monday in November. Voters cast ballots at their assigned precinct or via mail/early voting.' },
      { title: 'Electoral College', desc: 'For presidential elections, voters technically choose electors. A candidate needs 270 of 538 electoral votes to win.' },
      { title: 'Inauguration', desc: 'The President-elect is inaugurated on January 20th following the election.' }
    ],
    timeline: [
      { phase: 'Primaries', duration: 'Feb–Jun (election year)', desc: 'State-by-state primary elections' },
      { phase: 'Conventions', duration: 'Jul–Aug', desc: 'Party national conventions' },
      { phase: 'Debates', duration: 'Sep–Oct', desc: 'Presidential & VP debates' },
      { phase: 'Early Voting', duration: 'Varies by state', desc: 'In-person or mail-in early voting' },
      { phase: 'Election Day', duration: '1st Tue after 1st Mon in Nov', desc: 'National voting day' },
      { phase: 'Electoral Vote', duration: 'Mid-December', desc: 'Electors cast official votes' },
      { phase: 'Inauguration', duration: 'January 20', desc: 'New president sworn in' }
    ],
    checklist: ['Valid ID (requirements vary by state)', 'Confirm registration at vote.gov', 'Know your polling place', 'Check early/absentee voting options', 'Bring required documents for your state'],
    tips: 'Visit vote.gov for registration and canivote.org to check requirements in your state.'
  },
  uk: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    commission: 'Electoral Commission',
    eligibility: { age: 18, citizenship: 'British, Irish, or qualifying Commonwealth citizen', id: 'Voter Authority Certificate or approved photo ID (since 2023)', residency: 'Registered at a UK address' },
    votingMethod: 'Paper ballot (first-past-the-post for general elections)',
    steps: [
      { title: 'Voter Registration', desc: 'Register online at gov.uk/register-to-vote. You need your National Insurance number. The deadline is usually 12 working days before the election.' },
      { title: 'Dissolution of Parliament', desc: 'Parliament is dissolved, triggering a general election. The PM requests dissolution from the Monarch.' },
      { title: 'Candidate Nomination', desc: 'Candidates submit nomination papers to the local Returning Officer with signatures from registered voters in that constituency.' },
      { title: 'Campaigning', desc: 'Parties campaign across the country. Spending limits apply. Broadcast media must give balanced coverage.' },
      { title: 'Polling Day', desc: 'Voters go to their local polling station (7 AM–10 PM), show photo ID, receive a ballot paper, and mark their choice with an X.' },
      { title: 'Counting', desc: 'Votes are counted overnight at local count centres. Results are announced constituency by constituency.' },
      { title: 'Government Formation', desc: 'The party with the most seats (or a coalition with majority) forms the government. The leader becomes Prime Minister.' }
    ],
    timeline: [
      { phase: 'Dissolution', duration: 'Day 0', desc: 'Parliament dissolved' },
      { phase: 'Registration Deadline', duration: '~12 days before', desc: 'Last day to register' },
      { phase: 'Nominations', duration: '~19 days before', desc: 'Candidates formally nominated' },
      { phase: 'Campaign', duration: '~5 weeks', desc: 'Active campaigning period' },
      { phase: 'Polling Day', duration: 'Thursday (by convention)', desc: '7 AM to 10 PM' },
      { phase: 'Results', duration: 'Overnight–next day', desc: 'Counted and declared' }
    ],
    checklist: ['Photo ID (passport, driving licence, or Voter Authority Certificate)', 'Check your registration at gov.uk', 'Know your polling station (check poll card)', 'You can apply for a postal or proxy vote if needed'],
    tips: 'Visit electoralcommission.org.uk for official information and your local council for polling station details.'
  },
  general: {
    name: 'General (Global Overview)',
    flag: '🌍',
    commission: 'National Election Commission (varies by country)',
    eligibility: { age: '16–21 (varies)', citizenship: 'Citizen of the country', id: 'Government-issued ID (varies)', residency: 'Registered resident' },
    votingMethod: 'Paper ballots, electronic machines, or online voting (varies)',
    steps: [
      { title: 'Voter Registration', desc: 'Citizens register on the electoral roll through government offices or online portals. This confirms your eligibility to vote.' },
      { title: 'Election Announcement', desc: 'The election commission or government body officially announces the election, setting dates and rules.' },
      { title: 'Candidate Nomination', desc: 'Individuals or party representatives file their candidacy according to the rules — usually with signatures, deposits, or party endorsement.' },
      { title: 'Campaigning', desc: 'Candidates and parties promote their platforms through various media, rallies, and outreach. Most countries have campaign finance regulations.' },
      { title: 'Voting', desc: 'On election day, registered voters cast their ballots at designated polling stations or through absentee/mail-in methods.' },
      { title: 'Vote Counting', desc: 'Ballots are counted — either manually or electronically. Observers may be present to ensure transparency.' },
      { title: 'Result Declaration', desc: 'Official results are announced. The winning candidate or party assumes office according to constitutional procedures.' }
    ],
    timeline: [
      { phase: 'Announcement', duration: 'Weeks–months before', desc: 'Election officially called' },
      { phase: 'Registration', duration: 'Ongoing / deadline-based', desc: 'Voter registration period' },
      { phase: 'Nominations', duration: '1–4 weeks', desc: 'Candidates file papers' },
      { phase: 'Campaigning', duration: '2–8 weeks', desc: 'Active campaign period' },
      { phase: 'Election Day', duration: '1 day (or phased)', desc: 'Voting takes place' },
      { phase: 'Results', duration: 'Hours to weeks', desc: 'Votes counted & declared' }
    ],
    checklist: ['Valid government-issued ID', 'Confirm your voter registration', 'Know your polling location', 'Understand the voting method used', 'Check any deadlines for absentee/postal voting'],
    tips: 'Always check your country\'s official election commission website for the most accurate and up-to-date information.'
  }
};

// ============================================================
// MESSAGE RENDERING
// ============================================================
function addMessage(type, html) {
  const msg = document.createElement('div');
  msg.className = `message message--${type}`;
  const avatar = type === 'bot' ? '🗳️' : '👤';
  msg.innerHTML = `
    <div class="message__avatar">${avatar}</div>
    <div class="message__body">${html}</div>
  `;
  messagesEl.appendChild(msg);
  scrollToBottom();
}

function addBotMessage(html, delay = 600) {
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMessage('bot', html);
    scrollToBottom();
  }, delay);
}

function addUserMessage(text) {
  addMessage('user', `<p>${escapeHTML(text)}</p>`);
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'message message--bot';
  el.id = 'typing-msg';
  el.innerHTML = `
    <div class="message__avatar">🗳️</div>
    <div class="typing-indicator"><span></span><span></span><span></span></div>
  `;
  messagesEl.appendChild(el);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typing-msg');
  if (el) el.remove();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// QUICK ACTIONS
// ============================================================
function setQuickActions(actions) {
  quickActionsEl.innerHTML = '';
  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'quick-action-btn';
    btn.innerHTML = `<span class="emoji">${a.emoji}</span> ${a.label}`;
    btn.addEventListener('click', () => {
      addUserMessage(a.label);
      a.handler();
    });
    quickActionsEl.appendChild(btn);
  });
}

function clearQuickActions() {
  quickActionsEl.innerHTML = '';
}

// ============================================================
// BUILD CONTENT HTML
// ============================================================
function buildSteps(data) {
  let html = `<h2>📋 Step-by-Step: ${data.name} Election Process</h2>`;
  data.steps.forEach((s, i) => {
    html += `<div class="step-card">
      <div class="step-card__number">${i + 1}</div>
      <div class="step-card__content">
        <div class="step-card__title">${s.title}</div>
        <div class="step-card__desc">${s.desc}</div>
      </div>
    </div>`;
  });
  html += `<p style="margin-top:12px">💡 <em>${data.tips}</em></p>`;
  return html;
}

function buildTimeline(data) {
  let html = `<h2>⏱️ Election Timeline — ${data.name}</h2>
    <div class="timeline">`;
  data.timeline.forEach(t => {
    html += `<div class="timeline__item">
      <div class="timeline__label">${t.phase}</div>
      <div class="timeline__title">${t.duration}</div>
      <div class="timeline__desc">${t.desc}</div>
    </div>`;
  });
  html += `</div><p>📌 Exact dates are announced by the ${data.commission} for each election cycle.</p>`;
  return html;
}

function buildEligibility(data) {
  const e = data.eligibility;
  let html = `<h2>✅ Eligibility Check — ${data.name}</h2>
    <div class="info-card">
      <div class="info-card__title">📝 Who can vote?</div>
      <div class="info-card__content">
        <ul>
          <li><strong>Minimum Age:</strong> ${e.age} years</li>
          <li><strong>Citizenship:</strong> ${e.citizenship}</li>
          <li><strong>ID Required:</strong> ${e.id}</li>
          <li><strong>Residency:</strong> ${e.residency}</li>
        </ul>
      </div>
    </div>
    <p style="margin-top:8px">⚠️ <em>I recommend checking official election commission sources for exact, up-to-date eligibility criteria.</em></p>`;
  return html;
}

function buildHowToVote(data) {
  let html = `<h2>🗳️ How to Vote — ${data.name}</h2>
    <h3>Voting Method</h3>
    <p>${data.votingMethod}</p>
    <h3>What You Need</h3>
    <ul class="checklist">`;
  data.checklist.forEach(item => {
    html += `<li><span class="checklist__icon">✓</span> ${item}</li>`;
  });
  html += `</ul>
    <div class="info-card" style="margin-top:12px">
      <div class="info-card__title">💡 Pro Tip</div>
      <div class="info-card__content">${data.tips}</div>
    </div>`;
  return html;
}

function buildFullOverview(data) {
  let html = `<h2>🏛️ Full Election Overview — ${data.name}</h2>
    <div class="info-card">
      <div class="info-card__title">🏢 Governing Body</div>
      <div class="info-card__content">${data.commission}</div>
    </div>
    <h3>Voting Method</h3><p>${data.votingMethod}</p>
    <h3>Key Steps</h3>`;
  data.steps.forEach((s, i) => {
    html += `<div class="step-card">
      <div class="step-card__number">${i + 1}</div>
      <div class="step-card__content">
        <div class="step-card__title">${s.title}</div>
        <div class="step-card__desc">${s.desc}</div>
      </div>
    </div>`;
  });
  html += `<h3>Eligibility</h3><ul>
    <li><strong>Age:</strong> ${data.eligibility.age}</li>
    <li><strong>Citizenship:</strong> ${data.eligibility.citizenship}</li>
    <li><strong>ID:</strong> ${data.eligibility.id}</li>
  </ul><p style="margin-top:12px">💡 <em>${data.tips}</em></p>`;
  return html;
}

// ============================================================
// COUNTRY SELECTION
// ============================================================
function showCountrySelection(callback) {
  const countries = [
    { key: 'india', flag: '🇮🇳', name: 'India' },
    { key: 'usa', flag: '🇺🇸', name: 'United States' },
    { key: 'uk', flag: '🇬🇧', name: 'United Kingdom' },
    { key: 'general', flag: '🌍', name: 'General Overview' }
  ];
  let html = `<p>Which country's election process are you interested in?</p><div class="country-grid">`;
  countries.forEach(c => {
    html += `<button class="country-btn" data-country="${c.key}"><span class="flag">${c.flag}</span> ${c.name}</button>`;
  });
  html += `</div><p style="font-size:0.82rem;color:var(--text-muted)">Or type a country name below!</p>`;
  addBotMessage(html, 400);

  setTimeout(() => {
    document.querySelectorAll('.country-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.country;
        currentCountry = key;
        addUserMessage(ELECTION_DATA[key].name);
        callback(key);
      });
    });
  }, 500);
}

function getCountryData() {
  return ELECTION_DATA[currentCountry] || ELECTION_DATA.general;
}

// ============================================================
// MAIN MENU
// ============================================================
function showMainMenu() {
  conversationState = 'menu';
  const actions = [
    { emoji: '🏛️', label: 'Full election process', handler: () => handleTopic('full') },
    { emoji: '📋', label: 'Step-by-step guide', handler: () => handleTopic('steps') },
    { emoji: '⏱️', label: 'Show timeline', handler: () => handleTopic('timeline') },
    { emoji: '🗳️', label: 'How to vote', handler: () => handleTopic('vote') },
    { emoji: '✅', label: 'Eligibility check', handler: () => handleTopic('eligibility') },
    { emoji: '🌍', label: 'Change country', handler: () => startCountryFlow() }
  ];
  setQuickActions(actions);
}

function handleTopic(topic) {
  const data = getCountryData();
  let html = '';
  switch (topic) {
    case 'full': html = buildFullOverview(data); break;
    case 'steps': html = buildSteps(data); break;
    case 'timeline': html = buildTimeline(data); break;
    case 'vote': html = buildHowToVote(data); break;
    case 'eligibility': html = buildEligibility(data); break;
  }
  addBotMessage(html, 800);
  setTimeout(() => {
    addBotMessage(`<p>Would you like to explore something else? 👆 Pick an option above or ask me anything!</p>`, 400);
    showMainMenu();
  }, 1400);
}

function startCountryFlow() {
  clearQuickActions();
  conversationState = 'country-select';
  showCountrySelection(key => {
    addBotMessage(`<p>Great choice! ${ELECTION_DATA[key].flag} Here's what I can tell you about elections in <strong>${ELECTION_DATA[key].name}</strong>. What would you like to know?</p>`, 500);
    setTimeout(() => showMainMenu(), 600);
  });
}

// ============================================================
// NATURAL LANGUAGE HANDLER
// ============================================================
function handleFreeText(text) {
  const lower = text.toLowerCase();

  // Country detection
  if (/\bindia\b/.test(lower)) { currentCountry = 'india'; }
  else if (/\bu\.?s\.?a?\b|\bunited states\b|\bamerica\b/.test(lower)) { currentCountry = 'usa'; }
  else if (/\bu\.?k\.?\b|\bunited kingdom\b|\bbritain\b|\bengland\b/.test(lower)) { currentCountry = 'uk'; }

  if (!currentCountry && conversationState === 'country-select') {
    addBotMessage(`<p>I currently have detailed information for <strong>India, USA, and UK</strong>. You can also choose <strong>General Overview</strong> for a universal explanation. Please pick one from the options above!</p>`, 400);
    return;
  }

  if (!currentCountry) {
    if (/\belection\b|\bvot/.test(lower) || /\bhow\b|\bwhat\b|\bwhen\b|\bwho\b/.test(lower)) {
      currentCountry = 'general';
    } else {
      startCountryFlow();
      return;
    }
  }

  // Topic detection
  if (/\bstep\b|\bprocess\b|\bhow.*work\b|\bexplain\b/.test(lower)) {
    handleTopic('steps');
  } else if (/\btimeline\b|\bschedule\b|\bwhen\b|\bdate\b|\bphase\b/.test(lower)) {
    handleTopic('timeline');
  } else if (/\beligib\b|\bcan i vote\b|\bqualif\b|\bage\b|\bcitizen\b|\bwho can\b/.test(lower)) {
    handleTopic('eligibility');
  } else if (/\bhow to vote\b|\bvoting\b|\bballot\b|\bevm\b|\bwhat.*need\b|\bchecklist\b|\bpoll\b/.test(lower)) {
    handleTopic('vote');
  } else if (/\bfull\b|\boverall\b|\beverything\b|\bcomplete\b|\boverview\b/.test(lower)) {
    handleTopic('full');
  } else if (/\bfirst.time\b|\bnew voter\b|\bfirst voter\b/.test(lower)) {
    const data = getCountryData();
    let html = `<h2>🌟 First-Time Voter Guide — ${data.name}</h2>
      <p>Welcome! Voting for the first time is exciting. Here's a simple guide:</p>
      <div class="step-card"><div class="step-card__number">1</div><div class="step-card__content"><div class="step-card__title">Register</div><div class="step-card__desc">${data.steps[0].desc}</div></div></div>
      <div class="step-card"><div class="step-card__number">2</div><div class="step-card__content"><div class="step-card__title">Get Your ID Ready</div><div class="step-card__desc">Make sure you have: ${data.eligibility.id}</div></div></div>
      <div class="step-card"><div class="step-card__number">3</div><div class="step-card__content"><div class="step-card__title">Know Your Polling Station</div><div class="step-card__desc">Find out where you need to go to vote. Check your election commission's website or app.</div></div></div>
      <div class="step-card"><div class="step-card__number">4</div><div class="step-card__content"><div class="step-card__title">Vote!</div><div class="step-card__desc">${data.steps[4] ? data.steps[4].desc : 'Cast your vote using the method available in your area.'}</div></div></div>
      <p style="margin-top:12px">💡 <em>${data.tips}</em></p>`;
    addBotMessage(html, 700);
    setTimeout(() => {
      addBotMessage(`<p>You've got this! 🎉 Want to explore more? Pick an option above!</p>`, 400);
      showMainMenu();
    }, 1300);
  } else if (/\bhello\b|\bhi\b|\bhey\b|\bgreet/.test(lower)) {
    addBotMessage(`<p>Hello! 👋 Great to have you here. What would you like to learn about elections today? Pick an option below or just ask!</p>`, 400);
    showMainMenu();
  } else if (/\bthank\b|\bthanks\b/.test(lower)) {
    addBotMessage(`<p>You're welcome! 😊 Happy to help you understand the election process. Feel free to ask anything else!</p>`, 400);
  } else {
    addBotMessage(`<p>That's a great question! Let me point you in the right direction. You can explore:</p>
      <ul>
        <li>📋 <strong>Step-by-step guide</strong> — how the election process works</li>
        <li>⏱️ <strong>Timeline</strong> — key phases and dates</li>
        <li>✅ <strong>Eligibility</strong> — who can vote and requirements</li>
        <li>🗳️ <strong>How to vote</strong> — practical voting guide</li>
      </ul>
      <p>Pick one from the quick actions below, or rephrase your question! 👇</p>`, 500);
    showMainMenu();
  }
}

// ============================================================
// INPUT HANDLING
// ============================================================
function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = '';
  addUserMessage(text);
  handleFreeText(text);
}

btnSend.addEventListener('click', handleSend);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSend();
});

btnReset.addEventListener('click', () => {
  messagesEl.innerHTML = '';
  clearQuickActions();
  currentCountry = null;
  conversationState = 'welcome';
  startApp();
});

// ============================================================
// BOOT
// ============================================================
function startApp() {
  const welcomeHTML = `
    <h2>Hi! 👋 Welcome to Election Guide</h2>
    <p>I can help you understand how elections work — from voter registration to result declaration — in a simple, step-by-step way.</p>
    <p>Let's start by choosing a country so I can give you the most relevant information!</p>
  `;
  addBotMessage(welcomeHTML, 300);
  setTimeout(() => startCountryFlow(), 1000);
}

startApp();
