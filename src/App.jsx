import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Inject global styles ───────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    color: #e2e2e8;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    min-height: 100vh;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0f; }
  ::-webkit-scrollbar-thumb { background: #2d2d3a; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #7c3aed; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInPhase {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes barFill {
    from { width: 0%; }
    to { width: var(--target-width); }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .pye-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
  }

  .pye-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    border-bottom: 1px solid #1a1a2e;
    background: rgba(10, 10, 15, 0.9);
    backdrop-filter: blur(12px);
    position: relative;
    z-index: 10;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-logo {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #e2e2e8;
  }

  .header-logo span {
    color: #7c3aed;
  }

  .pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #7c3aed;
    flex-shrink: 0;
  }
  .pulse-dot.active {
    animation: pulse 1.4s ease-in-out infinite;
    background: #a78bfa;
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .phase-badge {
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #6b6b7a;
    padding: 3px 8px;
    border: 1px solid #1e1e2d;
    border-radius: 3px;
  }
  .phase-badge.active {
    color: #7c3aed;
    border-color: #3d1f7a;
    background: rgba(124, 58, 237, 0.06);
  }

  .reset-btn {
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #4a4a5a;
    padding: 4px 10px;
    border: 1px solid #1e1e2d;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .reset-btn:hover {
    color: #e2e2e8;
    border-color: #3a3a4a;
    background: rgba(255,255,255,0.03);
  }

  /* ── PHASE 1 ─────────────────────────────────────────────────────────── */
  .phase1 {
    display: flex;
    flex: 1;
    overflow: hidden;
    animation: fadeInPhase 0.5s ease;
    position: relative;
    z-index: 1;
  }

  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #12121e;
    min-width: 0;
  }

  .chat-progress {
    padding: 10px 20px;
    border-bottom: 1px solid #12121e;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  .progress-text {
    font-size: 10px;
    color: #4a4a5a;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .progress-text strong {
    color: #7c3aed;
  }

  .progress-bar-track {
    flex: 1;
    height: 2px;
    background: #1a1a2a;
    border-radius: 1px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #5b21b6, #7c3aed, #a78bfa);
    border-radius: 1px;
    transition: width 0.6s ease;
  }

  .time-left {
    font-size: 10px;
    color: #3a3a4a;
    white-space: nowrap;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .msg {
    display: flex;
    gap: 12px;
    animation: fadeIn 0.3s ease;
    max-width: 100%;
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
    letter-spacing: 0.05em;
  }
  .msg-avatar.ai { background: rgba(124, 58, 237, 0.2); color: #a78bfa; border: 1px solid rgba(124,58,237,0.3); }
  .msg-avatar.user { background: rgba(30, 30, 50, 0.8); color: #6b6b7a; border: 1px solid #1e1e2d; }

  .msg-body { flex: 1; min-width: 0; }

  .msg-role {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .msg-role.ai { color: #7c3aed; }
  .msg-role.user { color: #3a3a4a; }

  .msg-content {
    font-size: 13px;
    line-height: 1.7;
    color: #c8c8d4;
  }
  .msg-content.ai { color: #d4d4e0; }
  .msg-content.user { color: #8a8a9a; }

  .cursor-blink {
    display: inline-block;
    width: 8px;
    height: 14px;
    background: #7c3aed;
    margin-left: 2px;
    vertical-align: middle;
    animation: blink 1s step-end infinite;
  }

  .chat-input-area {
    padding: 16px 20px;
    border-top: 1px solid #12121e;
    flex-shrink: 0;
  }

  .input-wrapper {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .chat-textarea {
    flex: 1;
    background: #0d0d18;
    border: 1px solid #1e1e2d;
    border-radius: 6px;
    color: #e2e2e8;
    font-family: inherit;
    font-size: 13px;
    padding: 10px 14px;
    resize: none;
    min-height: 44px;
    max-height: 120px;
    line-height: 1.5;
    outline: none;
    transition: border-color 0.2s;
  }
  .chat-textarea:focus { border-color: #3d1f7a; }
  .chat-textarea::placeholder { color: #2e2e3e; }
  .chat-textarea:disabled { opacity: 0.4; cursor: not-allowed; }

  .send-btn {
    background: #7c3aed;
    border: none;
    border-radius: 6px;
    color: white;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    height: 44px;
    align-self: flex-end;
  }
  .send-btn:hover:not(:disabled) { background: #6d28d9; box-shadow: 0 0 16px rgba(124,58,237,0.3); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── PROFILE PANEL ────────────────────────────────────────────────────── */
  .profile-panel {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .profile-title {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3a3a4a;
    padding-bottom: 10px;
    border-bottom: 1px solid #12121e;
  }

  .dimension-block {
    display: flex;
    flex-direction: column;
    gap: 5px;
    animation: fadeIn 0.4s ease;
  }

  .dimension-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dimension-name {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5a5a6a;
  }

  .dimension-val {
    font-size: 10px;
    font-weight: 600;
    color: #7c3aed;
  }

  .dim-bar-track {
    height: 3px;
    background: #12121e;
    border-radius: 2px;
    overflow: hidden;
  }

  .dim-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #5b21b6, #a78bfa);
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dimension-label {
    font-size: 10px;
    color: #4a4a5a;
    line-height: 1.4;
    font-style: italic;
  }

  .profile-placeholder {
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0.3;
  }
  .placeholder-line {
    height: 2px;
    background: #1e1e2d;
    border-radius: 1px;
  }

  .radar-container {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  /* ── PHASE TRANSITION ────────────────────────────────────────────────── */
  .phase-complete-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 15, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeInPhase 0.4s ease;
    gap: 20px;
  }

  .phase-complete-title {
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #7c3aed;
  }

  .phase-complete-msg {
    font-size: 14px;
    color: #6b6b7a;
    text-align: center;
    max-width: 380px;
    line-height: 1.7;
  }

  .phase-complete-btn {
    margin-top: 10px;
    background: #7c3aed;
    border: none;
    border-radius: 6px;
    color: white;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 12px 28px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .phase-complete-btn:hover { background: #6d28d9; box-shadow: 0 0 20px rgba(124,58,237,0.4); }

  /* ── PHASE 2 ─────────────────────────────────────────────────────────── */
  .phase2 {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: fadeInPhase 0.5s ease;
    position: relative;
    z-index: 1;
  }

  .sim-top {
    padding: 16px 24px;
    border-bottom: 1px solid #12121e;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sim-label {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3a3a4a;
  }

  .scenario-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    font-size: 10px;
    color: #5a5a6a;
    padding: 4px 10px;
    border: 1px solid #1a1a2a;
    border-radius: 20px;
    cursor: pointer;
    font-family: inherit;
    background: transparent;
    transition: all 0.2s;
    line-height: 1.4;
  }
  .chip:hover {
    color: #a78bfa;
    border-color: #3d1f7a;
    background: rgba(124,58,237,0.06);
  }

  .scenario-input-row {
    display: flex;
    gap: 10px;
  }

  .scenario-input {
    flex: 1;
    background: #0d0d18;
    border: 1px solid #1e1e2d;
    border-radius: 6px;
    color: #e2e2e8;
    font-family: inherit;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .scenario-input:focus { border-color: #3d1f7a; }
  .scenario-input::placeholder { color: #2e2e3e; }

  .sim-btn {
    background: #7c3aed;
    border: none;
    border-radius: 6px;
    color: white;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 10px 18px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .sim-btn:hover:not(:disabled) { background: #6d28d9; box-shadow: 0 0 16px rgba(124,58,237,0.3); }
  .sim-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── SIM RESULTS ─────────────────────────────────────────────────────── */
  .sim-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sim-output-pane {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sim-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    opacity: 0.2;
  }

  .sim-empty-icon {
    font-size: 32px;
  }

  .sim-empty-text {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4a4a5a;
  }

  .simulation-block {
    animation: fadeIn 0.3s ease;
  }

  .sim-scenario-title {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #5b21b6;
    margin-bottom: 12px;
  }

  .sim-divider {
    border: none;
    border-top: 1px solid #1a1a2a;
    margin: 8px 0;
  }

  .sim-text {
    font-size: 13px;
    line-height: 1.8;
    color: #c8c8d4;
    white-space: pre-wrap;
  }

  .sim-confidence {
    font-size: 10px;
    color: #5b21b6;
    letter-spacing: 0.1em;
    padding: 8px 0;
    border-top: 1px solid #12121e;
    margin-top: 8px;
  }

  .why-toggle {
    background: transparent;
    border: 1px solid #1a1a2a;
    border-radius: 4px;
    color: #4a4a5a;
    font-family: inherit;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 10px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 6px;
  }
  .why-toggle:hover { color: #7c3aed; border-color: #3d1f7a; }

  .why-section {
    background: rgba(124, 58, 237, 0.03);
    border: 1px solid #1e1e2d;
    border-radius: 6px;
    padding: 12px 14px;
    margin-top: 8px;
    font-size: 11px;
    color: #5a5a6a;
    line-height: 1.7;
    animation: fadeIn 0.2s ease;
  }

  /* ── PROFILE SIDEBAR (Phase 2) ───────────────────────────────────────── */
  .sim-profile-sidebar {
    width: 260px;
    flex-shrink: 0;
    border-left: 1px solid #12121e;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dna-card {
    background: #0d0d18;
    border: 1px solid #1a1a2a;
    border-radius: 6px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dna-card-label {
    font-size: 8px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #3a3a4a;
  }

  .dna-card-value {
    font-size: 11px;
    color: #8a7aaa;
    line-height: 1.5;
  }

  /* ── FOLLOW-UP INPUT (Phase 2) ───────────────────────────────────────── */
  .followup-area {
    padding: 12px 24px;
    border-top: 1px solid #12121e;
    flex-shrink: 0;
    display: flex;
    gap: 10px;
  }

  .followup-input {
    flex: 1;
    background: #0d0d18;
    border: 1px solid #1e1e2d;
    border-radius: 6px;
    color: #e2e2e8;
    font-family: inherit;
    font-size: 12px;
    padding: 8px 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  .followup-input:focus { border-color: #3d1f7a; }
  .followup-input::placeholder { color: #2a2a3a; }
  .followup-input:disabled { opacity: 0.3; }

  .followup-btn {
    background: transparent;
    border: 1px solid #3d1f7a;
    border-radius: 6px;
    color: #7c3aed;
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 8px 14px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .followup-btn:hover:not(:disabled) { background: rgba(124,58,237,0.1); }
  .followup-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── ERROR BANNER ────────────────────────────────────────────────────── */
  .error-banner {
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a0a0a;
    border: 1px solid #4a1a1a;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 11px;
    color: #f87171;
    z-index: 200;
    max-width: 520px;
    width: 90%;
    animation: fadeIn 0.3s ease;
    line-height: 1.6;
  }

  .error-banner code {
    background: rgba(255,255,255,0.05);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: inherit;
  }
`;

function injectStyles() {
  if (document.getElementById('pye-styles')) return;
  const s = document.createElement('style');
  s.id = 'pye-styles';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

// ─── Ollama call ────────────────────────────────────────────────────────────
async function streamOllama({ messages, onChunk, onDone, onError, signal }) {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', messages, stream: true }),
      signal,
    });

    if (!response.ok) throw new Error(`Ollama error ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            full += json.message.content;
            onChunk(json.message.content, full);
          }
          if (json.done) { onDone(full); return; }
        } catch {}
      }
    }
    onDone(full);
  } catch (err) {
    if (err.name !== 'AbortError') onError(err);
  }
}

// ─── Interview system prompt ────────────────────────────────────────────────
const INTERVIEW_SYSTEM = `You are a deep psychological interviewer. Your job is to understand exactly how this specific person thinks and makes decisions — not how they want to be seen, but how they actually are.

Your questions must be:
- Situational and concrete, never abstract ("Are you brave?" is bad — "You're alone and see someone being mugged. What's your first instinct?" is good)
- Each question targets one of 6 dimensions: riskTolerance, moralFramework, socialDependence, fearProfile, loyaltyHierarchy, responseUnderPressure
- Adaptive — read their previous answer and probe where there's ambiguity or depth

Conversation rules:
- Acknowledge each answer in 1 sentence max. Empathetic but not sycophantic. Do NOT say "Great answer!" or similar.
- Then ask your next question.
- If someone gives a one-word answer, gently push for elaboration: "Tell me more — what's going through your head in that moment?"
- If someone is evasive, note it subtly and move on — avoidance is data.
- After at minimum 12 questions AND you feel you have enough on all 6 dimensions, end your message with [PROFILE_COMPLETE]
- Never explain your methodology. Just interview.

Start with this exact opening message:
"I'm going to ask you some questions — not to judge you, but to understand exactly how you think. There are no right answers here, and the more honest you are, the more accurate this will be.

Let's start with something immediate:

You're walking alone at night and you see someone drop their wallet and keep walking — they haven't noticed. What do you do first?"`;

const PROFILE_EXTRACT_PROMPT = (conversation) => `Based on this interview conversation, extract a precise psychological profile as JSON. No extra text — output ONLY the JSON object.

Conversation:
${conversation}

Output format:
{
  "riskTolerance": <0-100 integer>,
  "moralFramework": "<descriptive phrase>",
  "socialDependence": <0-100 integer>,
  "fearProfile": "<what they fear most, specific>",
  "loyaltyHierarchy": "<ordered, e.g. family > self > close friends>",
  "responseUnderPressure": "<specific behavior pattern>",
  "coreBeliefs": ["<belief 1>", "<belief 2>", "<belief 3>"],
  "blindSpots": ["<blind spot 1>", "<blind spot 2>"],
  "voiceSignature": "<how they communicate — tone, style, quirks>"
}`;

// ─── Simulation system prompt ───────────────────────────────────────────────
const SIM_SYSTEM = (dna) => `You are not simulating a generic human. You are simulating a specific person with this exact psychological profile:

${JSON.stringify(dna, null, 2)}

Simulation rules:
- Write in second person ("You feel...", "Your instinct is...", "You find yourself...")
- Be brutally honest — including their contradictions and blind spots
- Do NOT flatter. Do NOT make them heroic by default.
- Reference their specific fear profile and moral framework explicitly in how they react
- Reference their responseUnderPressure pattern in the action sections
- Be specific — not "you might feel scared" but "the specific kind of fear you feel is [tied to their fearProfile]"

Output this exact structure:

🧠 SIMULATING: [Scenario Title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMMEDIATE REACTION
[What they feel in the first 60 seconds — raw, physical, emotional]

WHAT THEY ACTUALLY DO
[Specific actions — not vague gestures. Tied to their responseUnderPressure pattern]

THE INTERNAL CONFLICT
[Where their values clash — shown as tension, not resolution. Reference moralFramework]

THE TURNING POINT
[The moment that defines their path — tied to their loyaltyHierarchy or fearProfile]

THE OUTCOME THEY'D MOST LIKELY REACH
[Honest, not heroic. Can be unglamorous.]

WHERE THEY'D SURPRISE THEMSELVES
[Based on their blindSpots — something they didn't expect about themselves]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Confidence: [X]% match to your profile

[WHY_ANALYSIS]
Profile dimensions that drove this simulation:
- Risk tolerance (${dna?.riskTolerance}/100): [how this shaped the response]
- Moral framework (${dna?.moralFramework}): [specific influence]
- Fear profile (${dna?.fearProfile}): [how this created the turning point]
- Response under pressure (${dna?.responseUnderPressure}): [direct quote behavior]
[/WHY_ANALYSIS]`;

// ─── RadarChart (inline SVG) ────────────────────────────────────────────────
function RadarChart({ profile }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const dims = ['riskTolerance', 'socialDependence'];
  const labels = ['Risk', 'Social'];

  const axes = [
    { label: 'Risk', key: 'riskTolerance', angle: -90 },
    { label: 'Social', key: 'socialDependence', angle: -18 },
    { label: 'Pressure', key: 'responsePressure', angle: 54 },
    { label: 'Loyalty', key: 'loyaltyNum', angle: 126 },
    { label: 'Moral', key: 'moralNum', angle: 198 },
  ];

  const derived = {
    riskTolerance: (profile.riskTolerance || 0) / 100,
    socialDependence: (profile.socialDependence || 0) / 100,
    responsePressure: 0.5,
    loyaltyNum: 0.6,
    moralNum: 0.7,
  };

  const toXY = (angle, val) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * val * Math.cos(rad),
      y: cy + r * val * Math.sin(rad),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPolys = gridLevels.map(level => {
    const pts = axes.map(a => toXY(a.angle, level));
    return pts.map(p => `${p.x},${p.y}`).join(' ');
  });

  const dataPoints = axes.map(a => toXY(a.angle, derived[a.key] || 0));
  const dataPoly = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {gridPolys.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#1a1a2a" strokeWidth="1" />
      ))}
      {axes.map(a => {
        const end = toXY(a.angle, 1);
        return <line key={a.key} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#1e1e2e" strokeWidth="1" />;
      })}
      <polygon
        points={dataPoly}
        fill="rgba(124,58,237,0.15)"
        stroke="#7c3aed"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#a78bfa" />
      ))}
      {axes.map(a => {
        const end = toXY(a.angle, 1.22);
        return (
          <text key={a.key} x={end.x} y={end.y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: '8px', fill: '#4a4a5a', fontFamily: 'inherit', letterSpacing: '0.05em' }}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Profile Panel ───────────────────────────────────────────────────────────
function ProfilePanel({ profile, phase }) {
  const numericDims = [
    { key: 'riskTolerance', label: 'Risk Tolerance' },
    { key: 'socialDependence', label: 'Social Dependence' },
  ];

  const hasData = profile && (profile.riskTolerance !== undefined || profile.moralFramework);

  return (
    <div className="profile-panel">
      <div className="profile-title">Live Profile</div>

      {hasData ? (
        <>
          <div className="radar-container">
            <RadarChart profile={profile} />
          </div>

          {numericDims.map(d => (
            profile[d.key] !== undefined && (
              <div className="dimension-block" key={d.key}>
                <div className="dimension-header">
                  <span className="dimension-name">{d.label}</span>
                  <span className="dimension-val">{profile[d.key]}</span>
                </div>
                <div className="dim-bar-track">
                  <div className="dim-bar-fill" style={{ width: `${profile[d.key]}%` }} />
                </div>
              </div>
            )
          ))}

          {profile.moralFramework && (
            <div className="dimension-block">
              <div className="dimension-name">Moral Framework</div>
              <div className="dimension-label">{profile.moralFramework}</div>
            </div>
          )}
          {profile.fearProfile && (
            <div className="dimension-block">
              <div className="dimension-name">Fear Profile</div>
              <div className="dimension-label">{profile.fearProfile}</div>
            </div>
          )}
          {profile.responseUnderPressure && (
            <div className="dimension-block">
              <div className="dimension-name">Under Pressure</div>
              <div className="dimension-label">{profile.responseUnderPressure}</div>
            </div>
          )}
          {profile.loyaltyHierarchy && (
            <div className="dimension-block">
              <div className="dimension-name">Loyalty Hierarchy</div>
              <div className="dimension-label">{profile.loyaltyHierarchy}</div>
            </div>
          )}
          {profile.coreBeliefs && profile.coreBeliefs.length > 0 && (
            <div className="dimension-block">
              <div className="dimension-name">Core Beliefs</div>
              {profile.coreBeliefs.map((b, i) => (
                <div key={i} className="dimension-label">· {b}</div>
              ))}
            </div>
          )}
          {profile.blindSpots && profile.blindSpots.length > 0 && (
            <div className="dimension-block">
              <div className="dimension-name">Blind Spots</div>
              {profile.blindSpots.map((b, i) => (
                <div key={i} className="dimension-label" style={{ color: '#6b3a3a' }}>· {b}</div>
              ))}
            </div>
          )}
          {profile.voiceSignature && (
            <div className="dimension-block">
              <div className="dimension-name">Voice</div>
              <div className="dimension-label">{profile.voiceSignature}</div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[80, 55, 70, 45, 60, 35].map((w, i) => (
            <div className="profile-placeholder" key={i}>
              <div className="placeholder-line" style={{ width: `${w * 0.6}%` }} />
              <div className="placeholder-line" style={{ width: `${w}%` }} />
            </div>
          ))}
          <div style={{ fontSize: 9, color: '#2a2a3a', textAlign: 'center', marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Awaiting responses...
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  injectStyles();

  // ── App state ──
  const [phase, setPhase] = useState('interview'); // 'interview' | 'transition' | 'simulation'
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);

  // ── Interview state ──
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [profilePartial, setProfilePartial] = useState({});
  const [interviewDone, setInterviewDone] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState('');
  const [userDNA, setUserDNA] = useState(null);
  const conversationRef = useRef([]);

  // ── Simulation state ──
  const [scenarioInput, setScenarioInput] = useState('');
  const [simResults, setSimResults] = useState([]);
  const [simStreaming, setSimStreaming] = useState('');
  const [followupInput, setFollowupInput] = useState('');
  const [simHistory, setSimHistory] = useState([]);
  const [showWhy, setShowWhy] = useState({});

  const messagesEndRef = useRef(null);
  const simEndRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMsg]);

  useEffect(() => {
    simEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simResults, simStreaming]);

  // Start interview on mount
  useEffect(() => {
    startInterview();
  }, []);

  function startInterview() {
    const sysMsg = { role: 'system', content: INTERVIEW_SYSTEM };
    // Prime with first AI question immediately
    const initial = [sysMsg];
    conversationRef.current = initial;
    setThinking(true);
    setStreamingMsg('');
    streamOllama({
      messages: initial,
      onChunk: (chunk, full) => setStreamingMsg(full),
      onDone: (full) => {
        const aiMsg = { role: 'assistant', content: full };
        conversationRef.current = [...initial, aiMsg];
        setMessages([{ role: 'assistant', content: full }]);
        setStreamingMsg('');
        setThinking(false);
        setQuestionCount(1);
      },
      onError: (err) => {
        setError(err.message);
        setThinking(false);
      },
    });
  }

  async function handleSendAnswer() {
    const text = inputText.trim();
    if (!text || thinking) return;
    setInputText('');

    const userMsg = { role: 'user', content: text };
    const updatedHistory = [...conversationRef.current, userMsg];
    conversationRef.current = updatedHistory;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setThinking(true);
    setStreamingMsg('');

    const abort = new AbortController();
    abortRef.current = abort;

    streamOllama({
      messages: updatedHistory,
      signal: abort.signal,
      onChunk: (chunk, full) => setStreamingMsg(full),
      onDone: (full) => {
        const aiMsg = { role: 'assistant', content: full };
        const finalHistory = [...updatedHistory, aiMsg];
        conversationRef.current = finalHistory;
        setMessages(prev => [...prev, { role: 'assistant', content: full }]);
        setStreamingMsg('');
        setThinking(false);
        setQuestionCount(prev => prev + 1);

        if (full.includes('[PROFILE_COMPLETE]')) {
          setInterviewDone(true);
          extractProfile(finalHistory);
        }
      },
      onError: (err) => {
        setError(err.message);
        setThinking(false);
      },
    });
  }

  function extractProfile(history) {
    const convo = history
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'PERSON' : 'INTERVIEWER'}: ${m.content}`)
      .join('\n\n');

    const extractMessages = [
      { role: 'system', content: 'You are a psychological analysis engine. Output only valid JSON. No markdown fences, no extra text.' },
      { role: 'user', content: PROFILE_EXTRACT_PROMPT(convo) },
    ];

    streamOllama({
      messages: extractMessages,
      onChunk: () => {},
      onDone: (full) => {
        try {
          const jsonMatch = full.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setUserDNA(parsed);
            setProfilePartial(parsed);
          }
        } catch (e) {
          console.error('Profile parse error', e);
        }
      },
      onError: (err) => setError(err.message),
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  }

  // ── Simulation ──
  async function runSimulation(scenario) {
    if (!scenario.trim() || thinking) return;
    setThinking(true);
    setSimStreaming('');

    const sysMsg = { role: 'system', content: SIM_SYSTEM(userDNA) };
    const userScenarioMsg = { role: 'user', content: `Simulate this scenario for me: ${scenario}` };
    const newHistory = [sysMsg, ...simHistory, userScenarioMsg];
    setSimHistory(prev => [...prev, userScenarioMsg]);

    const abort = new AbortController();
    abortRef.current = abort;

    streamOllama({
      messages: newHistory,
      signal: abort.signal,
      onChunk: (chunk, full) => setSimStreaming(full),
      onDone: (full) => {
        const aiMsg = { role: 'assistant', content: full };
        setSimHistory(prev => [...prev, aiMsg]);
        setSimResults(prev => [...prev, { scenario, response: full, id: Date.now() }]);
        setSimStreaming('');
        setThinking(false);
      },
      onError: (err) => {
        setError(err.message);
        setThinking(false);
      },
    });
  }

  function handleFollowup() {
    const text = followupInput.trim();
    if (!text || thinking) return;
    setFollowupInput('');
    runSimulation(text);
  }

  function resetAll() {
    if (abortRef.current) abortRef.current.abort();
    setPhase('interview');
    setMessages([]);
    setInputText('');
    setQuestionCount(0);
    setProfilePartial({});
    setInterviewDone(false);
    setStreamingMsg('');
    setUserDNA(null);
    setSimResults([]);
    setSimStreaming('');
    setFollowupInput('');
    setSimHistory([]);
    conversationRef.current = [];
    setThinking(false);
    setError(null);
    setTimeout(() => startInterview(), 100);
  }

  const EXAMPLE_SCENARIOS = [
    "You're a mid-level clerk in 1930s Berlin. The Party is rising.",
    "You find evidence your closest friend committed a serious crime.",
    "You're the first human to make contact with a non-hostile alien species.",
    "You're offered unlimited power but must give up one person you love.",
  ];

  const totalQ = 14;
  const progressPct = Math.min((questionCount / totalQ) * 100, 100);
  const minsLeft = Math.max(0, Math.round(((totalQ - questionCount) * 80) / 60));

  // Extract why analysis from simulation response
  function extractWhy(response) {
    const match = response.match(/\[WHY_ANALYSIS\]([\s\S]*?)\[\/WHY_ANALYSIS\]/);
    return match ? match[1].trim() : null;
  }

  function cleanResponse(response) {
    return response.replace(/\[WHY_ANALYSIS\][\s\S]*?\[\/WHY_ANALYSIS\]/, '').trim();
  }

  return (
    <div className="pye-root">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className={`pulse-dot ${thinking ? 'active' : ''}`} />
          <div className="header-logo">
            <span>Parallel</span> You Engine
          </div>
        </div>
        <div className="header-right">
          <div className={`phase-badge ${phase === 'interview' ? 'active' : ''}`}>Phase 1: Interview</div>
          <div className={`phase-badge ${phase === 'simulation' ? 'active' : ''}`}>Phase 2: Simulation</div>
          <button className="reset-btn" onClick={resetAll}>Reset Profile</button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          {error.includes('Failed to fetch') || error.includes('ERR_CONNECTION')
            ? <>Ollama not running. Start it with: <code>ollama serve</code> — then refresh.</>
            : `Error: ${error}`}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: 12, background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Phase 1: Interview ── */}
      {phase === 'interview' && (
        <div className="phase1">
          <div className="chat-panel">
            <div className="chat-progress">
              <span className="progress-text">
                Question <strong>{questionCount}</strong> of ~{totalQ}
              </span>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="time-left">~{minsLeft}m left</span>
            </div>

            <div className="messages">
              {messages.map((m, i) => (
                <div className="msg" key={i}>
                  <div className={`msg-avatar ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                    {m.role === 'assistant' ? 'AI' : 'YOU'}
                  </div>
                  <div className="msg-body">
                    <div className={`msg-role ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                      {m.role === 'assistant' ? 'Parallel You Engine' : 'You'}
                    </div>
                    <div className={`msg-content ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                      {m.content.replace('[PROFILE_COMPLETE]', '').trim()}
                    </div>
                  </div>
                </div>
              ))}

              {streamingMsg && (
                <div className="msg">
                  <div className="msg-avatar ai">AI</div>
                  <div className="msg-body">
                    <div className="msg-role ai">Parallel You Engine</div>
                    <div className="msg-content ai">
                      {streamingMsg.replace('[PROFILE_COMPLETE]', '').trim()}
                      <span className="cursor-blink" />
                    </div>
                  </div>
                </div>
              )}

              {thinking && !streamingMsg && (
                <div className="msg">
                  <div className="msg-avatar ai">AI</div>
                  <div className="msg-body">
                    <div className="msg-role ai">Parallel You Engine</div>
                    <div className="msg-content ai" style={{ color: '#3a3a4a' }}>
                      thinking<span className="cursor-blink" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              {interviewDone && userDNA ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <button
                    className="send-btn"
                    style={{ padding: '12px 28px', fontSize: 12, letterSpacing: '0.12em' }}
                    onClick={() => setPhase('simulation')}
                  >
                    Enter Simulation Mode →
                  </button>
                </div>
              ) : interviewDone ? (
                <div style={{ fontSize: 11, color: '#4a4a5a', textAlign: 'center' }}>
                  Extracting your profile<span className="cursor-blink" />
                </div>
              ) : (
                <div className="input-wrapper">
                  <textarea
                    className="chat-textarea"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Your answer... (Enter to send, Shift+Enter for newline)"
                    disabled={thinking}
                    rows={1}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSendAnswer}
                    disabled={thinking || !inputText.trim()}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>

          <ProfilePanel profile={profilePartial} phase="interview" />
        </div>
      )}

      {/* ── Phase 2: Simulation ── */}
      {phase === 'simulation' && (
        <div className="phase2">
          <div className="sim-top">
            <div className="sim-label">Drop any scenario — historical, fictional, hypothetical</div>
            <div className="scenario-chips">
              {EXAMPLE_SCENARIOS.map((s, i) => (
                <button key={i} className="chip" onClick={() => setScenarioInput(s)}>
                  {s.length > 60 ? s.slice(0, 58) + '…' : s}
                </button>
              ))}
            </div>
            <div className="scenario-input-row">
              <input
                className="scenario-input"
                value={scenarioInput}
                onChange={e => setScenarioInput(e.target.value)}
                placeholder="Describe any scenario..."
                onKeyDown={e => { if (e.key === 'Enter') { runSimulation(scenarioInput); setScenarioInput(''); } }}
                disabled={thinking}
              />
              <button
                className="sim-btn"
                onClick={() => { runSimulation(scenarioInput); setScenarioInput(''); }}
                disabled={thinking || !scenarioInput.trim()}
              >
                Simulate
              </button>
            </div>
          </div>

          <div className="sim-body">
            <div className="sim-output-pane">
              {simResults.length === 0 && !simStreaming && (
                <div className="sim-empty">
                  <div className="sim-empty-icon">⬡</div>
                  <div className="sim-empty-text">Awaiting scenario</div>
                </div>
              )}

              {simResults.map((result, i) => {
                const clean = cleanResponse(result.response);
                const why = extractWhy(result.response);
                return (
                  <div className="simulation-block" key={result.id}>
                    <div className="sim-text">{clean}</div>
                    {why && (
                      <>
                        <button
                          className="why-toggle"
                          onClick={() => setShowWhy(prev => ({ ...prev, [result.id]: !prev[result.id] }))}
                        >
                          {showWhy[result.id] ? '▲ Hide Analysis' : '▼ Why this answer?'}
                        </button>
                        {showWhy[result.id] && (
                          <div className="why-section">{why}</div>
                        )}
                      </>
                    )}
                    {i < simResults.length - 1 && <hr className="sim-divider" style={{ margin: '20px 0', borderColor: '#1a1a2a' }} />}
                  </div>
                );
              })}

              {simStreaming && (
                <div className="simulation-block">
                  {simResults.length > 0 && <hr className="sim-divider" style={{ margin: '20px 0', borderColor: '#1a1a2a' }} />}
                  <div className="sim-text">
                    {cleanResponse(simStreaming)}
                    <span className="cursor-blink" />
                  </div>
                </div>
              )}

              {thinking && !simStreaming && (
                <div style={{ fontSize: 11, color: '#3a3a4a', padding: '8px 0' }}>
                  simulating<span className="cursor-blink" />
                </div>
              )}

              <div ref={simEndRef} />
            </div>

            {/* Profile Sidebar */}
            {userDNA && (
              <div className="sim-profile-sidebar">
                <div className="profile-title">Your DNA</div>
                {userDNA.riskTolerance !== undefined && (
                  <div className="dna-card">
                    <div className="dna-card-label">Risk Tolerance</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="dim-bar-track" style={{ flex: 1 }}>
                        <div className="dim-bar-fill" style={{ width: `${userDNA.riskTolerance}%` }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#7c3aed' }}>{userDNA.riskTolerance}</span>
                    </div>
                  </div>
                )}
                {userDNA.socialDependence !== undefined && (
                  <div className="dna-card">
                    <div className="dna-card-label">Social Dependence</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="dim-bar-track" style={{ flex: 1 }}>
                        <div className="dim-bar-fill" style={{ width: `${userDNA.socialDependence}%` }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#7c3aed' }}>{userDNA.socialDependence}</span>
                    </div>
                  </div>
                )}
                {[
                  ['moralFramework', 'Moral Framework'],
                  ['fearProfile', 'Fear Profile'],
                  ['responseUnderPressure', 'Under Pressure'],
                  ['loyaltyHierarchy', 'Loyalty Order'],
                  ['voiceSignature', 'Voice'],
                ].map(([key, label]) => userDNA[key] && (
                  <div className="dna-card" key={key}>
                    <div className="dna-card-label">{label}</div>
                    <div className="dna-card-value">{userDNA[key]}</div>
                  </div>
                ))}
                {userDNA.coreBeliefs && (
                  <div className="dna-card">
                    <div className="dna-card-label">Core Beliefs</div>
                    {userDNA.coreBeliefs.map((b, i) => (
                      <div key={i} className="dna-card-value" style={{ fontSize: 10 }}>· {b}</div>
                    ))}
                  </div>
                )}
                {userDNA.blindSpots && (
                  <div className="dna-card" style={{ borderColor: '#2a1a1a' }}>
                    <div className="dna-card-label" style={{ color: '#5a2a2a' }}>Blind Spots</div>
                    {userDNA.blindSpots.map((b, i) => (
                      <div key={i} className="dna-card-value" style={{ fontSize: 10, color: '#7a4a4a' }}>· {b}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Follow-up input */}
          {simResults.length > 0 && (
            <div className="followup-area">
              <input
                className="followup-input"
                value={followupInput}
                onChange={e => setFollowupInput(e.target.value)}
                placeholder='Follow-up: "What if I also knew my family was being watched?"'
                onKeyDown={e => { if (e.key === 'Enter') handleFollowup(); }}
                disabled={thinking}
              />
              <button className="followup-btn" onClick={handleFollowup} disabled={thinking || !followupInput.trim()}>
                Follow-up
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
