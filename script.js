/* ==========================================================================
   NetFix — Game Engine, Playful Interactive Animations & Siklus Keputusan ADDIE
   Siklus: 1. Amati -> 2. Duga -> 3. Uji -> 4. Simpulkan -> 5. Evaluasi
   File: script.js
   ========================================================================== */

(function () {
  const state = {
    currentView: "view-home",
    activeCaseIndex: 0,
    step: 1, // 1:Amati, 2:Duga, 3:Uji, 4:Simpulkan, 5:Evaluasi
    score: 0,
    caseScores: {},
    completedCases: {},
    selectedHypothesis: null,
    executedTests: {},
    selectedSolution: null,
    isFixed: false,
    activeCodeTab: "index.html",
    searchQuery: "",
    hoveredNodeKey: null,
    canvasRipples: []
  };

  let animFrameId = null;
  let packets = [];
  let confettiParticles = [];
  let confettiAnimId = null;

  // Custom SVG Artworks for the 3 "Top Characters / Top Skenario Kasus" Cards
  const CASE_CHAR_SVGS = [
    // Kasus 1: Layer 1 Physical Cable Guardian
    '<svg viewBox="0 0 110 115" class="char-art-svg">' +
      '<circle cx="58" cy="58" r="42" fill="#dbeafe" />' +
      '<path d="M32 105 L48 58 L72 58 L84 105 Z" fill="#1d4ed8" />' +
      '<circle cx="58" cy="40" r="18" fill="#fed7aa" stroke="#1e3a8a" stroke-width="2.5" />' +
      '<path d="M40 36 Q58 18 76 36" fill="#0f172a" />' +
      '<rect x="45" y="35" width="26" height="8" rx="4" fill="#38bdf8" />' +
      '<path d="M20 82 Q55 35 95 68" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" />' +
      '<rect x="84" y="60" width="16" height="12" rx="3" fill="#ffde2e" stroke="#1e293b" stroke-width="2" />' +
    '</svg>',
    // Kasus 2: Layer 3 Gateway Router Striker
    '<svg viewBox="0 0 110 115" class="char-art-svg">' +
      '<circle cx="58" cy="58" r="42" fill="#e0e7ff" />' +
      '<path d="M30 105 L45 56 L74 56 L86 105 Z" fill="#3730a3" />' +
      '<circle cx="58" cy="39" r="18" fill="#fde68a" stroke="#312e81" stroke-width="2.5" />' +
      '<path d="M38 33 Q58 14 78 35" fill="#1e1b4b" />' +
      '<polygon points="88,42 102,56 88,78 74,56" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" />' +
      '<circle cx="88" cy="58" r="5" fill="#ffde2e" />' +
    '</svg>',
    // Kasus 3: Layer 7 DNS Resolver Specialist
    '<svg viewBox="0 0 110 115" class="char-art-svg">' +
      '<circle cx="58" cy="58" r="42" fill="#dcfce7" />' +
      '<path d="M32 105 L46 56 L72 56 L84 105 Z" fill="#0f766e" />' +
      '<circle cx="58" cy="39" r="18" fill="#cbd5e1" stroke="#0f172a" stroke-width="2.5" />' +
      '<rect x="44" y="33" width="28" height="11" rx="5" fill="#ef4444" />' +
      '<circle cx="52" cy="38" r="2.5" fill="#ffffff" />' +
      '<circle cx="64" cy="38" r="2.5" fill="#ffffff" />' +
      '<circle cx="26" cy="52" r="11" fill="#ffde2e" stroke="#fff" stroke-width="2" />' +
      '<text x="26" y="56" text-anchor="middle" font-size="8" font-weight="800" fill="#0f172a">DNS</text>' +
    '</svg>'
  ];

  function initPackets() {
    packets = [
      { progress: 0.1, speed: 0.0055, link: "router-switch" },
      { progress: 0.6, speed: 0.0055, link: "router-switch" },
      { progress: 0.25, speed: 0.006, link: "switch-pc" },
      { progress: 0.75, speed: 0.006, link: "switch-pc" },
      { progress: 0.35, speed: 0.005, link: "router-server" },
      { progress: 0.85, speed: 0.005, link: "router-server" }
    ];
  }

  // ============================================================================
  // Playful Confetti Particle Burst
  // ============================================================================
  function launchConfetti(count) {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#2f65f5", "#ffde2e", "#4ade80", "#38bdf8", "#f43f5e", "#a855f7"];
    const total = count || 45;

    for (let i = 0; i < total; i++) {
      confettiParticles.push({
        x: window.innerWidth * (0.3 + Math.random() * 0.4),
        y: window.innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 13,
        vy: -Math.random() * 11 - 4,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 1.0
      });
    }

    if (!confettiAnimId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // soft gravity
      p.vx *= 0.99;
      p.rot += p.vRot;
      p.life -= 0.014;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65, 2);
      ctx.fill();
      ctx.restore();
    });

    confettiParticles = confettiParticles.filter(function (p) {
      return p.life > 0 && p.y < canvas.height + 30;
    });

    if (confettiParticles.length > 0) {
      confettiAnimId = window.requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimId = null;
    }
  }

  // ============================================================================
  // View Navigation & Dashboard Rendering
  // ============================================================================
  function switchView(viewId) {
    state.currentView = viewId;
    document.querySelectorAll(".view-section").forEach(function (sec) {
      sec.classList.toggle("active", sec.id === viewId);
    });
    document.querySelectorAll("[data-nav]").forEach(function (btn) {
      if (btn.classList.contains("side-link") || btn.classList.contains("btn")) {
        btn.classList.toggle("btn-active-tab", btn.getAttribute("data-nav") === viewId);
      }
      if (btn.classList.contains("top-text-link")) {
        btn.classList.toggle("active", btn.getAttribute("data-nav") === viewId);
      }
    });

    if (viewId === "view-home") {
      renderHomeBentoWidgets();
    } else if (viewId === "view-cases") {
      renderCaseCards();
    } else if (viewId === "view-sim") {
      setTimeout(resizeCanvas, 30);
      renderSimulationStep();
    } else if (viewId === "view-summary") {
      renderSummaryView();
    } else if (viewId === "view-code") {
      renderCodeViewer();
    }
  }

  function renderHomeBentoWidgets() {
    // 1. Update Top Characters / Top Skenario Kasus Grid
    const topGrid = document.getElementById("homeTopCasesGrid");
    if (topGrid && window.NETFIX_CASES) {
      topGrid.innerHTML = "";
      const layers = ["L1", "L3", "L7"];
      const emblems = ["🔌", "🛡️", "🌐"];

      window.NETFIX_CASES.forEach(function (c, idx) {
        const done = Boolean(state.completedCases[c.id]);
        const best = state.caseScores[c.id] || 0;
        const card = document.createElement("div");
        card.className = "char-case-card";
        card.innerHTML =
          '<div class="char-left-col">' +
            '<div class="trophy-ring" style="' + (done ? 'border-color:#4ade80;background:#f0fdf4;' : '') + '">' +
              (done ? '🌟' : '🏆') +
            '</div>' +
            '<div class="char-stat-pills">' +
              '<span class="stat-sq solid">OSI</span>' +
              '<span>x</span>' +
              '<span class="stat-sq">' + layers[idx] + '</span>' +
            '</div>' +
            '<div class="char-match-lbl">' + (done ? 'Skor Tercapai' : 'Target Skor') + '</div>' +
            '<div class="char-yellow-pill">' + (done ? best + ' POIN ✓' : '100 POIN') + '</div>' +
          '</div>' +
          '<div class="char-right-col">' +
            (CASE_CHAR_SVGS[idx] || CASE_CHAR_SVGS[0]) +
            '<div class="char-card-title">Kasus 0' + (idx + 1) + ' • ' + c.difficulty + '</div>' +
          '</div>' +
          '<div class="char-bottom-emblem" title="' + c.title + '">' + emblems[idx] + '</div>';

        card.addEventListener("click", function () {
          startCase(idx);
        });
        topGrid.appendChild(card);
      });
    }

    // 2. Update Right Sidebar "Last Streams / Daftar Misi Kasus"
    const streamList = document.getElementById("homeQuickStreamList");
    if (streamList && window.NETFIX_CASES) {
      streamList.innerHTML = "";
      const icons = ["🔌", "🌐", "🔍"];
      window.NETFIX_CASES.forEach(function (c, idx) {
        const isCurrent = state.activeCaseIndex === idx;
        const done = Boolean(state.completedCases[c.id]);
        const item = document.createElement("div");
        item.className = "stream-item" + (isCurrent ? " active-stream" : "");
        item.innerHTML =
          '<div class="stream-thumb-avatar">' + icons[idx] + '</div>' +
          '<div class="stream-meta">' +
            '<div class="stream-meta-title">' + c.code + '</div>' +
            '<div class="stream-meta-sub">' + (done ? '✓ Tuntas (' + state.caseScores[c.id] + ' Poin)' : c.difficulty + ' • Klik untuk mulai') + '</div>' +
          '</div>' +
          '<div class="stream-play-dot">▶</div>';
        item.addEventListener("click", function () {
          startCase(idx);
        });
        streamList.appendChild(item);
      });
    }

    // 3. Update Timer / Score Counters in Home Stream Showcase
    const doneTotal = Object.keys(state.completedCases).length;
    const elDone = document.getElementById("homeWidgetCasesDone");
    const elScore = document.getElementById("homeWidgetScore");
    if (elDone) elDone.textContent = "0" + doneTotal;
    if (elScore) elScore.textContent = state.score < 10 ? "0" + state.score : String(state.score);
  }

  function renderCaseCards() {
    const container = document.getElementById("casesContainer");
    if (!container) return;
    container.innerHTML = "";
    const q = (state.searchQuery || "").toLowerCase().trim();

    window.NETFIX_CASES.forEach(function (c, idx) {
      if (q) {
        const hay = (c.code + " " + c.title + " " + c.kompetensi + " " + c.symptomReport).toLowerCase();
        if (hay.indexOf(q) === -1) return;
      }
      const done = Boolean(state.completedCases[c.id]);
      const best = state.caseScores[c.id] || 0;
      const card = document.createElement("div");
      card.className = "case-card";
      card.innerHTML =
        '<div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">' +
            '<span style="font-size:0.75rem;color:var(--royal-blue);font-weight:800;background:#eef4ff;padding:0.25rem 0.65rem;border-radius:999px;">' + c.code + '</span>' +
            '<span class="difficulty-badge ' + c.diffClass + '">' + c.difficulty + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:0.85rem;margin-bottom:0.65rem;">' +
            '<div style="width:62px;height:66px;flex-shrink:0;">' + (CASE_CHAR_SVGS[idx] || '') + '</div>' +
            '<div>' +
              '<h3 style="font-size:1.02rem;font-weight:800;line-height:1.25;margin-bottom:0.25rem;">' + c.title + '</h3>' +
              '<p style="font-size:0.76rem;color:var(--text-muted);font-weight:600;">' + c.kompetensi + '</p>' +
            '</div>' +
          '</div>' +
          '<p style="font-size:0.82rem;color:var(--text-main);background:var(--bg-card-soft);padding:0.75rem;border-radius:12px;border:1px solid var(--border-color);">' +
            c.symptomReport +
          '</p>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.1rem;padding-top:0.85rem;border-top:1px solid var(--border-color);">' +
          '<span style="font-size:0.8rem;color:' + (done ? 'var(--accent-lime)' : 'var(--text-muted)') + ';font-weight:800;">' +
            (done ? '🌟 Selesai (' + best + ' Poin)' : '🎯 Belum Diselesaikan') +
          '</span>' +
          '<button type="button" class="btn-yellow-pill btn-sm btn-start-case" data-case-idx="' + idx + '">' +
            (done ? 'Mainkan Ulang ↻' : 'Mulai Diagnosis →') +
          '</button>' +
        '</div>';
      container.appendChild(card);
    });

    container.querySelectorAll(".btn-start-case").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = parseInt(btn.getAttribute("data-case-idx"), 10);
        startCase(idx);
      });
    });
  }

  function startCase(idx) {
    window.NetFixAudio.click();
    state.activeCaseIndex = idx;
    state.step = 1;
    state.selectedHypothesis = null;
    state.executedTests = {};
    state.selectedSolution = null;
    state.isFixed = false;
    const c = window.NETFIX_CASES[idx];
    const term = document.getElementById("terminalOutput");
    if (term) {
      term.innerHTML =
        '<div class="term-line">[SYSTEM] Memuat simulasi ' + c.code + ' — ' + c.title + '...</div>' +
        '<div class="term-line term-warn">[ALERT] Anomali terdeteksi: ' + c.brokenNodeLabel + '</div>';
    }
    switchView("view-sim");
  }

  function appendTerminal(cmd, output, isWarn) {
    const term = document.getElementById("terminalOutput");
    if (!term) return;
    const div = document.createElement("div");
    div.className = "term-line";
    div.innerHTML =
      '<div class="term-cmd">root@smk-tkj:~# ' + cmd + '</div>' +
      '<div class="' + (isWarn ? 'term-warn' : '') + '" style="white-space:pre-line;">' + output + '</div>';
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
  }

  // ============================================================================
  // Interactive Decision Cycle Panel (Steps 1 to 5)
  // ============================================================================
  function renderSimulationStep() {
    const c = window.NETFIX_CASES[state.activeCaseIndex];
    if (!c) return;

    document.getElementById("simCaseTitle").textContent = c.code + " — " + c.title;
    document.getElementById("simCaseSub").textContent = c.kompetensi;
    document.getElementById("simStatusBadge").textContent = state.isFixed ? "✓ STATUS: JARINGAN NORMAL" : "⚠ STATUS: GANGGUAN TERDETEKSI";
    document.getElementById("simStatusBadge").className = "difficulty-badge " + (state.isFixed ? "diff-easy" : "diff-hard");

    const stepNames = [
      { id: 1, label: "👁️ 1. Amati" },
      { id: 2, label: "💡 2. Duga" },
      { id: 3, label: "🛠️ 3. Uji" },
      { id: 4, label: "⚡ 4. Simpulkan" },
      { id: 5, label: "🏆 5. Evaluasi" }
    ];
    const tracker = document.getElementById("stepTracker");
    tracker.innerHTML = "";
    stepNames.forEach(function (s) {
      const sp = document.createElement("div");
      sp.className = "step-pill" + (state.step === s.id ? " current" : (state.step > s.id ? " done" : ""));
      sp.textContent = s.label;
      tracker.appendChild(sp);
    });

    const panel = document.getElementById("decisionPanelContent");
    panel.innerHTML = "";

    if (state.step === 1) {
      let cluesHtml = "";
      c.observeClues.forEach(function (cl) {
        cluesHtml += '<li style="margin-bottom:0.45rem;">' + cl + '</li>';
      });
      panel.innerHTML =
        '<span class="pill-tag-light" style="background:#eef4ff;color:var(--royal-blue);margin-bottom:0.4rem;">TAHAP 01 / 05 • OBSERVE</span>' +
        '<h4 style="color:var(--text-main);font-size:1.08rem;font-weight:800;margin-bottom:0.4rem;">Tahap 1: Amati Gejala Gangguan</h4>' +
        '<p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:0.85rem;">Perhatikan laporan keluhan dan indikator merah berkedip pada diagram topologi interaktif di sebelah kiri:</p>' +
        '<div style="background:var(--bg-card-soft);border:1.5px solid var(--border-color);padding:0.95rem;border-radius:14px;font-size:0.84rem;margin-bottom:1rem;">' +
          '<strong style="color:var(--royal-blue);">📋 Laporan Kasus:</strong> ' + c.symptomReport +
          '<ul style="margin-top:0.65rem;padding-left:1.2rem;color:var(--text-muted);">' + cluesHtml + '</ul>' +
        '</div>' +
        '<button type="button" class="btn-yellow-pill" id="btnNextToDuga" style="width:100%;">Lanjut ke Tahap 2: Rumuskan Dugaan (Duga) →</button>';

      document.getElementById("btnNextToDuga").addEventListener("click", function () {
        window.NetFixAudio.click();
        state.step = 2;
        renderSimulationStep();
      });
    } else if (state.step === 2) {
      panel.innerHTML =
        '<span class="pill-tag-light" style="background:#eef4ff;color:var(--royal-blue);margin-bottom:0.4rem;">TAHAP 02 / 05 • HYPOTHESIZE</span>' +
        '<h4 style="color:var(--text-main);font-size:1.08rem;font-weight:800;margin-bottom:0.35rem;">Tahap 2: Duga Penyebab Masalah</h4>' +
        '<p style="font-size:0.84rem;color:var(--text-muted);">Berdasarkan gejala yang diamati, pilih hipotesis penyebab gangguan yang paling logis:</p>' +
        '<div class="choice-list" id="hypoChoices"></div>' +
        '<div id="hypoFeedback"></div>';

      const list = document.getElementById("hypoChoices");
      c.hypotheses.forEach(function (h) {
        const b = document.createElement("button");
        b.type = "button";
        const isSel = state.selectedHypothesis && state.selectedHypothesis.id === h.id;
        b.className = "choice-btn" + (isSel ? (h.correct ? " selected-correct" : " selected-wrong") : "");
        b.textContent = h.text;
        b.addEventListener("click", function () {
          state.selectedHypothesis = h;
          if (h.correct) {
            window.NetFixAudio.success();
            launchConfetti(28);
          } else {
            window.NetFixAudio.error();
          }
          renderSimulationStep();
        });
        list.appendChild(b);
      });

      if (state.selectedHypothesis) {
        const fb = document.getElementById("hypoFeedback");
        fb.innerHTML =
          '<div class="feedback-banner" style="border-color:' + (state.selectedHypothesis.correct ? 'var(--accent-lime)' : 'var(--accent-amber)') + ';">' +
            '<strong>💡 Umpan Balik Hipotesis:</strong> ' + state.selectedHypothesis.feedback +
          '</div>' +
          '<div style="margin-top:0.85rem;display:flex;justify-content:flex-end;">' +
            '<button type="button" class="btn-yellow-pill" id="btnNextToUji">Lanjut ke Tahap 3: Uji Jaringan (Test) →</button>' +
          '</div>';
        document.getElementById("btnNextToUji").addEventListener("click", function () {
          window.NetFixAudio.click();
          state.step = 3;
          renderSimulationStep();
        });
      }
    } else if (state.step === 3) {
      panel.innerHTML =
        '<span class="pill-tag-light" style="background:#eef4ff;color:var(--royal-blue);margin-bottom:0.4rem;">TAHAP 03 / 05 • DIAGNOSTIC TEST</span>' +
        '<h4 style="color:var(--text-main);font-size:1.08rem;font-weight:800;margin-bottom:0.35rem;">Tahap 3: Uji & Periksa Jaringan</h4>' +
        '<p style="font-size:0.84rem;color:var(--text-muted);">Pilih instrumen pengujian diagnostik untuk membuktikan hipotesis Anda (perhatikan output di Terminal Log):</p>' +
        '<div class="choice-list" id="testChoices"></div>' +
        '<div id="testNextWrap" style="margin-top:0.85rem;"></div>';

      const tList = document.getElementById("testChoices");
      c.tests.forEach(function (t) {
        const ran = Boolean(state.executedTests[t.id]);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice-btn" + (ran ? " selected-correct" : "");
        b.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">' +
            '<span><strong>' + t.label + '</strong> <code style="color:var(--royal-blue);font-weight:700;">(' + t.cmd + ')</code></span>' +
            '<span style="font-size:0.74rem;font-weight:800;color:' + (ran ? 'var(--accent-lime)' : 'var(--royal-blue)') + ';">' + (ran ? '✓ Sudah Diuji' : '▶ Jalankan') + '</span>' +
          '</div>';
        b.addEventListener("click", function () {
          window.NetFixAudio.scan();
          state.executedTests[t.id] = true;
          appendTerminal(t.cmd, t.output, t.essential);
          renderSimulationStep();
        });
        tList.appendChild(b);
      });

      const ranCount = Object.keys(state.executedTests).length;
      if (ranCount > 0) {
        const wrap = document.getElementById("testNextWrap");
        wrap.innerHTML =
          '<div class="feedback-banner">' +
            '🛠️ Anda telah menjalankan <strong>' + ranCount + '</strong> pengujian diagnostik. Periksa hasil output pada Terminal Log sebelum menyimpulkan perbaikan.' +
          '</div>' +
          '<div style="margin-top:0.85rem;display:flex;justify-content:flex-end;">' +
            '<button type="button" class="btn-yellow-pill" id="btnNextToSimpulkan">Lanjut ke Tahap 4: Simpulkan Solusi →</button>' +
          '</div>';
        document.getElementById("btnNextToSimpulkan").addEventListener("click", function () {
          window.NetFixAudio.click();
          state.step = 4;
          renderSimulationStep();
        });
      }
    } else if (state.step === 4) {
      panel.innerHTML =
        '<span class="pill-tag-light" style="background:#eef4ff;color:var(--royal-blue);margin-bottom:0.4rem;">TAHAP 04 / 05 • APPLY SOLUTION</span>' +
        '<h4 style="color:var(--text-main);font-size:1.08rem;font-weight:800;margin-bottom:0.35rem;">Tahap 4: Simpulkan & Terapkan Perbaikan</h4>' +
        '<p style="font-size:0.84rem;color:var(--text-muted);">Berdasarkan bukti pengujian di terminal, pilih tindakan perbaikan yang tepat:</p>' +
        '<div class="choice-list" id="solChoices"></div>' +
        '<div id="solFeedback"></div>';

      const sList = document.getElementById("solChoices");
      c.solutions.forEach(function (s) {
        const isSel = state.selectedSolution && state.selectedSolution.id === s.id;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice-btn" + (isSel ? (s.correct ? " selected-correct" : " selected-wrong") : "");
        b.textContent = s.text;
        b.addEventListener("click", function () {
          state.selectedSolution = s;
          if (s.correct) {
            state.isFixed = true;
            window.NetFixAudio.success();
            launchConfetti(60);
            appendTerminal("netfix --apply-fix", "[SUCCESS] Perbaikan diterapkan. Aliran paket data kembali normal!", false);
          } else {
            state.isFixed = false;
            window.NetFixAudio.error();
            appendTerminal("netfix --apply-fix", "[FAILED] Tindakan belum mengatasi akar gangguan jaringan.", true);
          }
          renderSimulationStep();
        });
        sList.appendChild(b);
      });

      if (state.selectedSolution) {
        const sfb = document.getElementById("solFeedback");
        sfb.innerHTML =
          '<div class="feedback-banner" style="border-color:' + (state.selectedSolution.correct ? 'var(--accent-lime)' : 'var(--accent-red)') + ';">' +
            '<strong>⚡ Hasil Tindakan:</strong> ' + state.selectedSolution.explanation +
          '</div>' +
          (state.selectedSolution.correct
            ? '<div style="margin-top:0.85rem;display:flex;justify-content:flex-end;">' +
                '<button type="button" class="btn-yellow-pill" id="btnFinishCase">Lihat Evaluasi & Skor Kasus (Tahap 5) 🏆 →</button>' +
              '</div>'
            : '<p style="font-size:0.8rem;color:var(--accent-amber);font-weight:700;margin-top:0.55rem;">Silakan pilih solusi perbaikan yang tepat hingga status jaringan pulih.</p>');
        const finBtn = document.getElementById("btnFinishCase");
        if (finBtn) {
          finBtn.addEventListener("click", function () {
            finalizeCaseScore(c);
          });
        }
      }
    } else if (state.step === 5) {
      const earned = state.caseScores[c.id] || 0;
      panel.innerHTML =
        '<span class="pill-tag-light" style="background:var(--accent-lime-bg);color:var(--accent-lime);margin-bottom:0.4rem;">TAHAP 05 / 05 • MISSION COMPLETE</span>' +
        '<h4 style="color:var(--text-main);font-size:1.12rem;font-weight:800;margin-bottom:0.45rem;">Tahap 5: Evaluasi Diagnosis</h4>' +
        '<div class="feedback-banner" style="border-color:#86efac;background:#f0fdf4;">' +
          '<div style="font-size:1.5rem;font-weight:800;color:var(--accent-lime);margin-bottom:0.35rem;">🏆 Skor Kasus: ' + earned + ' / 100 Poin</div>' +
          '<p style="font-size:0.85rem;">Selamat! Anda telah menyelesaikan siklus diagnosis <strong>Amati → Duga → Uji → Simpulkan → Evaluasi</strong> pada <strong>' + c.title + '</strong>.</p>' +
        '</div>' +
        '<div style="display:flex;gap:0.65rem;margin-top:1rem;flex-wrap:wrap;">' +
          '<button type="button" class="btn-yellow-pill" id="btnBackToCases">Pilih Kasus Lainnya →</button>' +
          '<button type="button" class="btn btn-outline" id="btnGoSummary">Lihat Rapor Keseluruhan</button>' +
        '</div>';

      document.getElementById("btnBackToCases").addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-cases");
      });
      document.getElementById("btnGoSummary").addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-summary");
      });
    }
  }

  function finalizeCaseScore(c) {
    window.NetFixAudio.success();
    launchConfetti(75);
    let pts = 40;
    if (state.selectedHypothesis && state.selectedHypothesis.correct) pts += 30;
    const essentialRan = c.tests.some(function (t) { return t.essential && state.executedTests[t.id]; });
    if (essentialRan) pts += 30;
    state.caseScores[c.id] = pts;
    state.completedCases[c.id] = true;

    let total = 0;
    Object.keys(state.caseScores).forEach(function (k) { total += state.caseScores[k]; });
    state.score = total;
    document.getElementById("topScoreDisplay").textContent = "Skor: " + state.score;
    state.step = 5;
    renderSimulationStep();
  }

  function renderSummaryView() {
    const tbody = document.getElementById("summaryTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    let totalScore = 0;
    let doneCount = 0;

    window.NETFIX_CASES.forEach(function (c, idx) {
      const done = Boolean(state.completedCases[c.id]);
      const sc = state.caseScores[c.id] || 0;
      if (done) doneCount += 1;
      totalScore += sc;
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML =
        '<td style="font-weight:800;color:var(--royal-blue);">' + c.code + '</td>' +
        '<td style="font-weight:600;">' + c.title + '</td>' +
        '<td><span class="difficulty-badge ' + c.diffClass + '">' + c.difficulty + '</span></td>' +
        '<td style="color:' + (done ? 'var(--accent-lime)' : 'var(--text-muted)') + ';font-weight:800;">' +
          (done ? '✓ Tuntas' : 'Belum') +
        '</td>' +
        '<td style="text-align:right;font-weight:800;">' + sc + ' / 100</td>';
      tr.addEventListener("click", function () {
        startCase(idx);
      });
      tbody.appendChild(tr);
    });

    document.getElementById("summaryTotalCases").textContent = doneCount + " / " + window.NETFIX_CASES.length + " Kasus";
    document.getElementById("summaryTotalScore").textContent = totalScore + " / 300 Poin";
    const badgeEl = document.getElementById("summaryRankBadge");
    if (doneCount === 3 && totalScore >= 270) {
      badgeEl.textContent = "🌟 Senior Network Troubleshooter";
      badgeEl.style.color = "var(--accent-lime)";
    } else if (doneCount >= 1) {
      badgeEl.textContent = "⚡ Junior Network Technician";
      badgeEl.style.color = "var(--royal-blue)";
    } else {
      badgeEl.textContent = "Pemula — Yuk Mulai Simulasi!";
      badgeEl.style.color = "var(--text-muted)";
    }
  }

  // ============================================================================
  // Modular Code Viewer Support
  // ============================================================================
  function loadSourceFilesForViewer() {
    window.NETFIX_SOURCE_FILES = window.NETFIX_SOURCE_FILES || {
      "index.html": document.documentElement.outerHTML,
      "cases.js": "window.NETFIX_CASES = " + JSON.stringify(window.NETFIX_CASES, null, 2) + ";",
      "audio.js": "window.NetFixAudio = /* Web Audio API Synthesizer Module */\n" + window.NetFixAudio.toString(),
      "style.css": "/* Style UI EasyPlay Light Blue, White Cards & Playful Yellow Pills */",
      "script.js": "/* Game Engine, Interactive Topology Canvas & Confetti System */"
    };

    ["index.html", "style.css", "cases.js", "audio.js", "script.js"].forEach(function (fname) {
      fetch(fname)
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (txt) {
          if (txt) {
            window.NETFIX_SOURCE_FILES[fname] = txt;
            if (state.currentView === "view-code" && state.activeCodeTab === fname) {
              renderCodeViewer();
            }
          }
        })
        .catch(function () {});
    });
  }

  function renderCodeViewer() {
    const codeView = document.getElementById("codeBlockContent");
    if (!codeView || !window.NETFIX_SOURCE_FILES) return;
    codeView.textContent = window.NETFIX_SOURCE_FILES[state.activeCodeTab] || "";
    document.querySelectorAll("[data-code-file]").forEach(function (btn) {
      btn.classList.toggle("btn-active-tab", btn.getAttribute("data-code-file") === state.activeCodeTab);
    });
  }

  // ============================================================================
  // Playful Interactive Canvas Network Topology Animation
  // ============================================================================
  function resizeCanvas() {
    const canvas = document.getElementById("topologyCanvas");
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width));
    canvas.height = Math.max(250, Math.floor(rect.height));
  }

  function getTopologyNodes(w, h, timeNow) {
    const bob1 = Math.sin(timeNow * 0.003) * 3.5;
    const bob2 = Math.sin(timeNow * 0.003 + 1.4) * 3.5;
    const bob3 = Math.sin(timeNow * 0.003 + 2.8) * 3.5;
    const bob4 = Math.sin(timeNow * 0.003 + 4.2) * 3.5;

    return {
      router: {
        x: w * 0.20,
        y: h * 0.50 + bob1,
        label: "Router-GW",
        ip: "192.168.10.1",
        icon: "🌐",
        role: "Default Gateway (Layer 3)"
      },
      switchNode: {
        x: w * 0.50,
        y: h * 0.50 + bob2,
        label: "Switch-Lab",
        ip: "FastEthernet 0/1-24",
        icon: "🖧",
        role: "Distribusi LAN (Layer 2)"
      },
      pc: {
        x: w * 0.80,
        y: h * 0.28 + bob3,
        label: "PC-Client-01",
        ip: "192.168.10.25",
        icon: "💻",
        role: "Workstation Siswa"
      },
      server: {
        x: w * 0.80,
        y: h * 0.74 + bob4,
        label: "Server-DNS/Web",
        ip: "10.10.10.2",
        icon: "🗄️",
        role: "Portal & DNS Resolver (Layer 7)"
      }
    };
  }

  function setupCanvasInteractivity() {
    const canvas = document.getElementById("topologyCanvas");
    const tooltip = document.getElementById("canvasNodeTooltip");
    if (!canvas) return;

    canvas.addEventListener("mousemove", function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const nodes = getTopologyNodes(canvas.width, canvas.height, Date.now());
      let foundKey = null;

      Object.keys(nodes).forEach(function (k) {
        const nd = nodes[k];
        const dist = Math.hypot(mx - nd.x, my - nd.y);
        if (dist <= 30) foundKey = k;
      });

      state.hoveredNodeKey = foundKey;
      canvas.style.cursor = foundKey ? "pointer" : "default";

      if (tooltip) {
        if (foundKey) {
          const nd = nodes[foundKey];
          tooltip.innerHTML = "<strong>" + nd.icon + " " + nd.label + "</strong> (" + nd.ip + ")<br/><span>" + nd.role + " — Klik untuk ping cepat</span>";
          tooltip.style.left = Math.min(canvas.width - 190, Math.max(12, nd.x - 70)) + "px";
          tooltip.style.top = Math.max(10, nd.y - 68) + "px";
          tooltip.classList.add("visible");
        } else {
          tooltip.classList.remove("visible");
        }
      }
    });

    canvas.addEventListener("mouseleave", function () {
      state.hoveredNodeKey = null;
      if (tooltip) tooltip.classList.remove("visible");
    });

    canvas.addEventListener("click", function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const nodes = getTopologyNodes(canvas.width, canvas.height, Date.now());

      Object.keys(nodes).forEach(function (k) {
        const nd = nodes[k];
        if (Math.hypot(mx - nd.x, my - nd.y) <= 32) {
          window.NetFixAudio.click();
          state.canvasRipples.push({ x: nd.x, y: nd.y, r: 18, alpha: 0.9 });
          appendTerminal(
            "inspect --node " + nd.label,
            "[INSPECT] " + nd.label + " (" + nd.ip + ") — Peran: " + nd.role,
            false
          );
        }
      });
    });
  }

  function drawTopology() {
    const canvas = document.getElementById("topologyCanvas");
    if (canvas && state.currentView === "view-sim") {
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const now = Date.now();
      ctx.clearRect(0, 0, w, h);

      // Subtle background grid dots
      ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
      for (let gx = 24; gx < w; gx += 32) {
        for (let gy = 24; gy < h; gy += 32) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const c = window.NETFIX_CASES[state.activeCaseIndex] || window.NETFIX_CASES[0];
      const broken = state.isFixed ? null : c.brokenLink;
      const nodes = getTopologyNodes(w, h, now);

      const links = [
        { id: "router-switch", from: nodes.router, to: nodes.switchNode },
        { id: "switch-pc", from: nodes.switchNode, to: nodes.pc },
        { id: "router-server", from: nodes.switchNode, to: nodes.server }
      ];

      // Draw links
      links.forEach(function (lnk) {
        const isBrk = broken === lnk.id;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lnk.from.x, lnk.from.y);
        ctx.lineTo(lnk.to.x, lnk.to.y);
        ctx.lineWidth = isBrk ? 3.5 : 4;
        ctx.strokeStyle = isBrk ? "#f43f5e" : (state.isFixed ? "#4ade80" : "#3b82f6");
        if (isBrk) ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.restore();

        // Pulsing Warning Indicator on Broken Link
        if (isBrk) {
          const mx = (lnk.from.x + lnk.to.x) / 2;
          const my = (lnk.from.y + lnk.to.y) / 2;
          const pulse = 12 + Math.sin(now * 0.008) * 5;
          ctx.save();
          ctx.beginPath();
          ctx.arc(mx, my, pulse, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(244, 63, 94, 0.28)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(mx, my, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#f43f5e";
          ctx.fill();

          // Pill badge for broken label
          ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
          const txt = "⚠ " + c.brokenNodeLabel;
          const tw = ctx.measureText(txt).width + 16;
          ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
          ctx.beginPath();
          ctx.roundRect(mx - tw / 2, my - 34, tw, 20, 10);
          ctx.fill();
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = "#ffe4e6";
          ctx.textAlign = "center";
          ctx.fillText(txt, mx, my - 20);
          ctx.restore();
        }
      });

      // Animate packets along links
      packets.forEach(function (pkt) {
        const lnk = links.find(function (l) { return l.id === pkt.link; });
        if (!lnk) return;
        const isBrk = broken === lnk.id;
        pkt.progress += pkt.speed;
        if (pkt.progress > 1) pkt.progress = 0;
        const limit = isBrk ? 0.46 : 1.0;
        const p = Math.min(pkt.progress, limit);
        const px = lnk.from.x + (lnk.to.x - lnk.from.x) * p;
        const py = lnk.from.y + (lnk.to.y - lnk.from.y) * p;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fillStyle = isBrk ? "rgba(255, 222, 46, 0.24)" : "rgba(74, 222, 128, 0.24)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = isBrk ? "#ffde2e" : "#4ade80";
        ctx.fill();
        ctx.restore();
      });

      // Click Ripples
      state.canvasRipples.forEach(function (rp) {
        rp.r += 1.8;
        rp.alpha -= 0.03;
        ctx.save();
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 222, 46, " + Math.max(0, rp.alpha) + ")";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      });
      state.canvasRipples = state.canvasRipples.filter(function (rp) { return rp.alpha > 0; });

      // Draw Nodes
      Object.keys(nodes).forEach(function (key) {
        const nd = nodes[key];
        const isHovered = state.hoveredNodeKey === key;
        const radius = isHovered ? 28 : 24;

        ctx.save();
        // Outer glow
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = isHovered
          ? "rgba(255, 222, 46, 0.28)"
          : (state.isFixed ? "rgba(74, 222, 128, 0.18)" : "rgba(59, 130, 246, 0.2)");
        ctx.fill();

        // Main node circle
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#1e3a8a";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = isHovered ? "#ffde2e" : (state.isFixed ? "#4ade80" : "#60a5fa");
        ctx.stroke();

        // Emoji Icon inside Node
        ctx.font = (isHovered ? "18px" : "15px") + " sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nd.icon, nd.x, nd.y);

        // Label below node
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11.5px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(nd.label, nd.x, nd.y + radius + 16);
        ctx.fillStyle = "#93c5fd";
        ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(nd.ip, nd.x, nd.y + radius + 30);
        ctx.restore();
      });
    }
    animFrameId = window.requestAnimationFrame(drawTopology);
  }

  // ============================================================================
  // Initialization & Event Listeners
  // ============================================================================
  window.addEventListener("load", function () {
    initPackets();
    resizeCanvas();
    setupCanvasInteractivity();
    loadSourceFilesForViewer();
    window.addEventListener("resize", resizeCanvas);

    // Navigation buttons
    document.querySelectorAll("[data-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView(btn.getAttribute("data-nav"));
      });
    });

    // Quick Case Jump Buttons (Sidebar & Matchup Cards)
    document.querySelectorAll("[data-quick-case]").forEach(function (el) {
      el.addEventListener("click", function () {
        const idx = parseInt(el.getAttribute("data-quick-case"), 10) || 0;
        startCase(idx);
      });
    });

    // Mini Game Cards (Siklus Keputusan ADDIE row in Home)
    document.querySelectorAll(".mini-game-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        document.querySelectorAll(".mini-game-card").forEach(function (c) {
          c.classList.remove("active-blue");
        });
        card.classList.add("active-blue");
      });
      card.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-sim");
      });
    });

    // Brand Logo & Sidebar Bonus Card
    const brandLogo = document.getElementById("brandLogoHome");
    if (brandLogo) {
      brandLogo.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-home");
      });
    }

    const bonusCard = document.getElementById("sidebarBonusCard");
    if (bonusCard) {
      bonusCard.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-cases");
      });
    }

    // Sidebar Info Links
    const btnSideGuide = document.getElementById("btnSideGuide");
    if (btnSideGuide) {
      btnSideGuide.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-sim");
      });
    }
    const btnSideTeam = document.getElementById("btnSideTeam");
    if (btnSideTeam) {
      btnSideTeam.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-home");
        const tw = document.getElementById("teamWidgetCard");
        if (tw) tw.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    // Hero & Stream Showcase buttons
    const btnHeroStart = document.getElementById("btnHeroStart");
    if (btnHeroStart) {
      btnHeroStart.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-cases");
      });
    }
    const btnHeroCode = document.getElementById("btnHeroCode");
    if (btnHeroCode) {
      btnHeroCode.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-code");
      });
    }
    const homeStreamBanner = document.getElementById("homeStreamBanner");
    if (homeStreamBanner) {
      homeStreamBanner.addEventListener("click", function () {
        window.NetFixAudio.click();
        switchView("view-sim");
      });
    }

    // Search Input Filter
    const searchInput = document.getElementById("globalSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.searchQuery = searchInput.value;
        if (state.currentView !== "view-cases" && state.searchQuery.trim().length > 0) {
          switchView("view-cases");
        } else if (state.currentView === "view-cases") {
          renderCaseCards();
        }
      });
    }

    // Audio Mute button
    const btnMute = document.getElementById("btnToggleAudio");
    if (btnMute) {
      btnMute.addEventListener("click", function () {
        const m = window.NetFixAudio.toggleMute();
        const iconSpan = document.getElementById("audioIconSpan");
        const dot = document.getElementById("audioDot");
        if (iconSpan) iconSpan.textContent = m ? "🔇" : "🔊";
        if (dot) dot.style.background = m ? "#94a3b8" : "var(--royal-blue)";
      });
    }

    // Code viewer file buttons
    document.querySelectorAll("[data-code-file]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.NetFixAudio.click();
        state.activeCodeTab = btn.getAttribute("data-code-file");
        renderCodeViewer();
      });
    });

    // Copy code button
    const btnCopyCode = document.getElementById("btnCopyCode");
    if (btnCopyCode) {
      btnCopyCode.addEventListener("click", function () {
        window.NetFixAudio.success();
        const text = (window.NETFIX_SOURCE_FILES && window.NETFIX_SOURCE_FILES[state.activeCodeTab]) || "";
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        btnCopyCode.textContent = "✓ Kode Tersalin!";
        setTimeout(function () { btnCopyCode.textContent = "📋 Salin Kode File Ini"; }, 1500);
      });
    }

    renderHomeBentoWidgets();
    renderCaseCards();
    renderSimulationStep();
    if (animFrameId) window.cancelAnimationFrame(animFrameId);
    animFrameId = window.requestAnimationFrame(drawTopology);
  });
})();
