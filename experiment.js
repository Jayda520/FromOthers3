// Emoji Social Attention (Web) - jsPsych version
// 等价于你给的 PsychoPy 脚本（trial生成规则、时长、键位、练习达标循环、数据列顺序）

(() => {
  // -----------------------------
  // Parameters (match PsychoPy)
  // -----------------------------
  const FONT_FAMILY = `"Microsoft YaHei UI","Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif`;

  const SAME_KEY = 'j';
  const DIFF_KEY = 'f';
  const QUIT_KEY = 'escape'; // 浏览器里 ESC 我们作为退出/结束：会结束实验并下载数据

  const N_PRACTICE = 15;
  const N_BLOCK1 = 80;
  const N_BLOCK2 = 80;

  const PASS_CRITERION = 0.75;

  const FIX_DUR = 1.0;       // sec
  const MEM_DUR = 0.5;       // sec
  const CUE_DUR = 1.0;       // sec
  const PROBE_MAX_RT = 3.0;  // sec

  const CONNECT_MIN = 5, CONNECT_MAX = 15;
  const SEND_MIN = 0.2, SEND_MAX = 1.5;

  // positions (we simulate left/right layout using flex gap)
  const IMG_SIZE = 194;

  // -----------------------------
  // Stimuli pools (same as your script)
  // -----------------------------
  const MEM_POOL = [
    "assets/MemoryStimuli/stim_0089.png",
    "assets/MemoryStimuli/stim_0095.png",
    "assets/MemoryStimuli/stim_0307.png",
    "assets/MemoryStimuli/stim_0395.png",
    "assets/MemoryStimuli/stim_0405.png",
    "assets/MemoryStimuli/stim_0652.png",
    "assets/MemoryStimuli/stim_0797.png",
  ];

  // 兼容 CueStimuli / CueSimuli（按你Python的逻辑）
  const CUE_DIR_CANDIDATES = ["assets/CueStimuli", "assets/CueSimuli"];
  // 我们无法像python那样直接 os.path.isdir，这里做法：预加载时两套都加，实际用“能加载的那套”
  // 最稳：你就保留 assets/CueStimuli 这个名字即可。

  const CUE_PAIR = [
    ["anger.png",     "stim_0001_anger.png"],
    ["calmness.png",  "stim_circular-041_calmness.png"],
    ["disgust.png",   "stim_dim1-074_disgust.png"],
    ["fear.png",      "stim_dim2-fear.png"],
    ["happiness.png", "stim_0262_happiness.png"],
    ["sadness.png",   "stim_0806_sadness.png"],
    ["surprise.png",  "stim_0889_surprise.png"],
  ];

  const INSTR = {
    welcome:   "assets/InstructionImages/welcome.png",
    procedure: "assets/InstructionImages/procedure.png",
    practice_intro: "assets/InstructionImages/practice_intro.png",
    practice_fail:  "assets/InstructionImages/practice_fail.png",
    formal_intro:   "assets/InstructionImages/formal_intro.png",
    break:          "assets/InstructionImages/break.png",
    end:            "assets/InstructionImages/end.png",
  };

  // -----------------------------
  // Ordered CSV columns (match PsychoPy)
  // -----------------------------
  const ORDERED_FIELDS = [
    "name", "birthdate", "gender", "handedness",
    "block", "trial", "isPractice",
    "condition", "congruency", "cueSide", "probeSide", "isSame",
    "memL", "memR", "emoji_fn", "stim_fn", "probeStim",
    "respKey", "rt", "acc", "sendDur"
  ];

  // -----------------------------
  // Helpers
  // -----------------------------
  const randUniform = (a, b) => a + Math.random() * (b - a);
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sampleTwoDistinct = (arr) => {
    const a = choice(arr);
    let b = choice(arr);
    while (b === a) b = choice(arr);
    return [a, b];
  };

  function makeFlagsRatio(n, ratio1) {
    const n1 = Math.round(n * ratio1);
    const flags = Array(n1).fill(1).concat(Array(n - n1).fill(0));
    return shuffle(flags);
  }

  function makeTrials(nTrials, congRatio = 0.60, condRatio = 0.50) {
    const condFlags = makeFlagsRatio(nTrials, condRatio); // 1=emoji, 0=complexStimulus
    const nEmoji = condFlags.reduce((s, x) => s + x, 0);
    const nComp = nTrials - nEmoji;

    const congEmoji = makeFlagsRatio(nEmoji, congRatio); // 1=congruent
    const congComp  = makeFlagsRatio(nComp,  congRatio);

    const sameFlags = makeFlagsRatio(nTrials, 0.50); // 1=same

    let idxE = 0, idxC = 0;
    const trials = [];

    for (let i = 0; i < nTrials; i++) {
      let [m1, m2] = sampleTwoDistinct(MEM_POOL);
      let memL, memR;
      if (Math.random() < 0.5) { memL = m1; memR = m2; }
      else { memL = m2; memR = m1; }

      const [emojiFn, stimFn] = choice(CUE_PAIR);
      const cueSide = choice(["left", "right"]); // emoji side

      const condition = condFlags[i] === 1 ? "emoji" : "complexStimulus";

      let congruentFlag;
      if (condition === "emoji") { congruentFlag = congEmoji[idxE++]; }
      else { congruentFlag = congComp[idxC++]; }
      const congruency = congruentFlag === 1 ? "congruent" : "incongruent";

      const opposite = cueSide === "left" ? "right" : "left";

      let probeSide;
      if (condition === "emoji") {
        probeSide = (congruentFlag === 1) ? cueSide : opposite;
      } else {
        probeSide = (congruentFlag === 1) ? opposite : cueSide;
      }

      const isSame = sameFlags[i]; // 1/0
      let probeStim;
      if (isSame === 1) {
        probeStim = (probeSide === "left") ? memL : memR;
      } else {
        const remain = MEM_POOL.filter(x => x !== memL && x !== memR);
        probeStim = choice(remain);
      }

      trials.push({
        memL, memR,
        emoji_fn: emojiFn,
        stim_fn: stimFn,
        cueSide,
        condition,
        congruency,
        isSame,
        probeSide,
        probeStim,
      });
    }
    return trials;
  }

  // 生成 cue 实际路径：优先 CueStimuli，其次 CueSimuli
  function cuePath(filename) {
    // 先返回 CueStimuli，若你只有 CueSimuli，把文件夹改名最省事
    return `${CUE_DIR_CANDIDATES[0]}/${filename}`;
  }
  function cuePathAlt(filename) {
    return `${CUE_DIR_CANDIDATES[1]}/${filename}`;
  }

  // CSV encode
  function toCSV(rows, fields) {
    const esc = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = fields.join(",");
    const lines = rows.map(r => fields.map(f => esc(r[f])).join(","));
    return [header].concat(lines).join("\n");
  }

  function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // -----------------------------
  // jsPsych init
  // -----------------------------
  const jsPsych = initJsPsych({
    on_finish: () => {
      // 统一在结束时导出 ordered csv
      const all = jsPsych.data.get().values();
      // 只保留我们写过的 trial row（有 block 字段）
      const rows = all.filter(d => d && typeof d.block === "string" && d.block.length > 0);

      const csv = toCSV(rows, ORDERED_FIELDS);

      const pid = (jsPsych.data.get().select("name").values[0] || "NA").toString().trim().replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
      downloadText(`${pid}_EmojiSocial_${dateStr}_ordered.csv`, csv);

      // 结束时恢复鼠标
      document.body.classList.remove("hide-cursor");
    }
  });

  // 隐藏鼠标（与你 PsychoPy 一致）
  document.body.classList.add("hide-cursor");

  // -----------------------------
  // Preload list (images)
  // -----------------------------
  const preloadImages = [
    ...Object.values(INSTR),
    ...MEM_POOL,
  ];

  // cues：两套目录都加，避免你文件夹名不一致导致预加载失败
  for (const [e, s] of CUE_PAIR) {
    preloadImages.push(`${CUE_DIR_CANDIDATES[0]}/${e}`, `${CUE_DIR_CANDIDATES[0]}/${s}`);
    preloadImages.push(`${CUE_DIR_CANDIDATES[1]}/${e}`, `${CUE_DIR_CANDIDATES[1]}/${s}`);
  }

  // -----------------------------
  // Reusable screens
  // -----------------------------
  const imagePage = (imgPath) => ({
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPath,
    choices: [' '], // space
    render_on_canvas: false
  });

  const connectingPage = (minS, maxS) => {
    const dur = randUniform(minS, maxS);
    return {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
          <div class="center-wrap" style="font-family:${FONT_FAMILY}">
            <div id="connText" class="bigtext">正在与对方连接...\n\n请稍候</div>
          </div>
        `;
      },
      choices: "NO_KEYS",
      trial_duration: dur * 1000,
      on_load: () => {
        const el = document.getElementById("connText");
        let dots = 0;
        const timer = setInterval(() => {
          dots = (dots + 1) % 4;
          el.textContent = `正在与对方连接${".".repeat(dots)}\n\n请稍候`;
        }, 200);
        jsPsych.getCurrentTrial()._connInterval = timer;
      },
      on_finish: () => {
        const t = jsPsych.getCurrentTrial();
        if (t && t._connInterval) clearInterval(t._connInterval);
      }
    };
  };

  const sendingPage = (minS, maxS) => {
    const dur = randUniform(minS, maxS);
    return {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `
          <div class="center-wrap" style="font-family:${FONT_FAMILY}">
            <div id="sendText" class="bigtext">对方正在发送......</div>
          </div>
        `;
      },
      choices: "NO_KEYS",
      trial_duration: dur * 1000,
      data: { sendDur: dur },
      on_load: () => {
        const el = document.getElementById("sendText");
        let dots = 0;
        const timer = setInterval(() => {
          dots = (dots + 1) % 7;
          el.textContent = `对方正在发送${".".repeat(dots)}`;
        }, 100);
        jsPsych.getCurrentTrial()._sendInterval = timer;
      },
      on_finish: () => {
        const t = jsPsych.getCurrentTrial();
        if (t && t._sendInterval) clearInterval(t._sendInterval);
      }
    };
  };

  // Fixation only
  const fixation = (sec, extraData = {}) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div class="center-wrap"><p class="fix">+</p></div>`,
    choices: "NO_KEYS",
    trial_duration: sec * 1000,
    data: extraData
  });

  // Memory: two images + fixation
  const memoryDisplay = (tr) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return `
        <div class="center-wrap" style="font-family:${FONT_FAMILY}">
          <div class="row">
            <div class="imgbox"><img src="${tr.memL}" /></div>
            <div class="imgbox"><img src="${tr.memR}" /></div>
          </div>
          <p class="fix">+</p>
        </div>
      `;
    },
    choices: "NO_KEYS",
    trial_duration: MEM_DUR * 1000,
    data: {
      memL: tr.memL, memR: tr.memR
    }
  });

  // Cue: emoji + stim + fixation
  const cueDisplay = (tr) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const emoji = cuePath(tr.emoji_fn);
      const stim  = cuePath(tr.stim_fn);

      // 位置：cueSide 表示 emoji 的左右
      const leftImg  = (tr.cueSide === "left") ? emoji : stim;
      const rightImg = (tr.cueSide === "left") ? stim  : emoji;

      return `
        <div class="center-wrap" style="font-family:${FONT_FAMILY}">
          <div class="row">
            <div class="imgbox"><img src="${leftImg}" onerror="this.src='${cuePathAlt(tr.cue_fn_fallback_left || "")}'" /></div>
            <div class="imgbox"><img src="${rightImg}" onerror="this.src='${cuePathAlt(tr.cue_fn_fallback_right || "")}'" /></div>
          </div>
          <p class="fix">+</p>
        </div>
      `;
    },
    choices: "NO_KEYS",
    trial_duration: CUE_DUR * 1000,
    data: {
      cueSide: tr.cueSide,
      emoji_fn: tr.emoji_fn,
      stim_fn: tr.stim_fn
    }
  });

  // Probe: one image at left/right + fixation; collect response
  const probeDisplay = (tr, isPractice, blockName, trialIndex, subjInfo) => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const left = tr.probeSide === "left" ? tr.probeStim : "";
      const right = tr.probeSide === "right" ? tr.probeStim : "";

      return `
        <div class="center-wrap" style="font-family:${FONT_FAMILY}">
          <div class="row">
            <div class="imgbox">${left ? `<img src="${left}" />` : ``}</div>
            <div class="imgbox">${right ? `<img src="${right}" />` : ``}</div>
          </div>
          <p class="fix">+</p>
        </div>
      `;
    },
    choices: [SAME_KEY, DIFF_KEY, QUIT_KEY],
    trial_duration: PROBE_MAX_RT * 1000,
    data: {
      // demographics (like your ordered csv)
      name: subjInfo.name,
      birthdate: subjInfo.birthdate,
      gender: subjInfo.gender,
      handedness: subjInfo.handedness,

      block: blockName,
      trial: trialIndex,
      isPractice: isPractice ? 1 : 0,

      condition: tr.condition,
      congruency: tr.congruency,
      cueSide: tr.cueSide,
      probeSide: tr.probeSide,
      isSame: tr.isSame,

      memL: tr.memL,
      memR: tr.memR,
      emoji_fn: tr.emoji_fn,
      stim_fn: tr.stim_fn,
      probeStim: tr.probeStim
    },
    on_finish: (data) => {
      // key
      const respKey = data.response ? data.response.toLowerCase() : "";
      data.respKey = respKey;

      // rt in ms -> seconds (to match your PsychoPy "clock.getTime()")
      data.rt = (data.rt === null || data.rt === undefined) ? "" : (data.rt / 1000);

      // acc logic same as python
      let acc = 0;
      if (!respKey) acc = 0;
      else if (tr.isSame === 1 && respKey === SAME_KEY) acc = 1;
      else if (tr.isSame === 0 && respKey === DIFF_KEY) acc = 1;
      else acc = 0;
      data.acc = acc;

      // 如果按了 ESC：结束实验并导出（我们直接结束时间线）
      if (respKey === QUIT_KEY) {
        jsPsych.endExperiment("已退出（ESC）。");
      }
    }
  });

  const practiceFeedback = () => ({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      const last = jsPsych.data.get().last(1).values()[0];
      const txt = (last && last.acc === 1) ? "恭喜你答对了！" : "很遗憾，你答错了。";
      return `<div class="center-wrap"><div class="bigtext" style="font-family:${FONT_FAMILY}">${txt}</div></div>`;
    },
    choices: "NO_KEYS",
    trial_duration: 600
  });

  // -----------------------------
  // Build a block timeline
  // -----------------------------
  function buildBlockTimeline(trials, isPractice, blockName, subjInfo) {
    const tl = [];
    for (let i = 0; i < trials.length; i++) {
      const tr = trials[i];

      tl.push(fixation(FIX_DUR));
      tl.push(memoryDisplay(tr));

      // Sending page (no extra fixation before it)
      const send = sendingPage(SEND_MIN, SEND_MAX);
      // 把 sendDur 写进后续 probe 行：用 jsPsych 的 data merging（在 probe 里读取 last sendDur）
      tl.push(send);

      tl.push(cueDisplay(tr));

      // Probe：把 sendDur 合并进同一行（和你 python rows 里一致）
      tl.push({
        timeline: [
          probeDisplay(tr, isPractice, blockName, i + 1, subjInfo),
        ],
        on_timeline_finish: () => {
          // 将“上一条 probe”补上最近一次 sending 的 sendDur
          const lastSend = jsPsych.data.get().filter({ trial_type: "html-keyboard-response" }).last(2).values();
          // 更稳：直接从 data 栈里找最近一个带 sendDur 的
          const recentSend = jsPsych.data.get().filterCustom(d => typeof d.sendDur === "number").last(1).values()[0];
          const recentProbeIndex = jsPsych.data.get().last(1).values()[0];

          // 给刚刚那条 probe 追加 sendDur（如果它还没有）
          const lastRow = jsPsych.data.get().last(1);
          if (lastRow.values()[0] && (lastRow.values()[0].sendDur === undefined)) {
            lastRow.addToAll({ sendDur: recentSend ? recentSend.sendDur : "" });
          }
        }
      });

      if (isPractice) tl.push(practiceFeedback());
    }
    return tl;
  }

  // 计算练习正确率（从 data 中筛 practice 的 probe 行）
  function computePracticeAcc() {
    const rows = jsPsych.data.get().filter({ block: "practice" }).filterCustom(d => d && typeof d.acc === "number").values();
    if (!rows.length) return 0;
    const mean = rows.reduce((s, r) => s + (r.acc || 0), 0) / rows.length;
    return mean;
  }

  // -----------------------------
  // Participant form (name, birthdate, gender, handedness)
  // -----------------------------
  const demoForm = {
    type: jsPsychSurveyHtmlForm,
    preamble: `<div style="font-family:${FONT_FAMILY}; color:#000; font-size:24px; text-align:center; margin-bottom:12px;">
      实验信息（请填写）
    </div>`,
    html: `
      <div style="font-family:${FONT_FAMILY}; color:#000; font-size:20px;">
        <p>姓名：<input name="name" type="text" required /></p>
        <p>出生日期：
          <input name="birthdate" type="date" required />
        </p>
        <p>性别：
          <select name="gender" required>
            <option value="">请选择</option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="Other">Other</option>
          </select>
        </p>
        <p>利手：
          <select name="handedness" required>
            <option value="">请选择</option>
            <option value="Right">Right</option>
            <option value="Left">Left</option>
            <option value="Both">Both</option>
          </select>
        </p>
        <p style="opacity:.8">按下“继续”开始。</p>
      </div>
    `,
    button_label: "继续",
    on_finish: (data) => {
      const resp = data.response || {};
      jsPsych.data.addProperties({
        name: (resp.name || "").trim() || "NA",
        birthdate: resp.birthdate || "",
        gender: resp.gender || "",
        handedness: resp.handedness || ""
      });
    }
  };

  // -----------------------------
  // Timeline assembly
  // -----------------------------
  const timeline = [];

  // preload
  timeline.push({
    type: jsPsychPreload,
    images: preloadImages,
    show_progress_bar: true,
    message: "正在加载材料，请稍候…"
  });

  // fullscreen on
  timeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: `<div style="font-family:${FONT_FAMILY}; color:#000; font-size:24px;">
      即将进入全屏实验。<br/><br/>请按按钮进入全屏。
    </div>`,
    button_label: "进入全屏"
  });

  timeline.push(demoForm);

  // Instructions
  timeline.push(imagePage(INSTR.welcome));
  timeline.push(imagePage(INSTR.procedure));

  // Practice loop: intro -> connecting -> 15 trials(with feedback) -> check criterion else fail page and repeat
  timeline.push({
    timeline: [
      imagePage(INSTR.practice_intro),
      connectingPage(CONNECT_MIN, CONNECT_MAX),

      // practice block
      {
        timeline: [],
        on_start: () => {
          const subjInfo = {
            name: jsPsych.data.get().select("name").values[0],
            birthdate: jsPsych.data.get().select("birthdate").values[0],
            gender: jsPsych.data.get().select("gender").values[0],
            handedness: jsPsych.data.get().select("handedness").values[0],
          };
          const trials = makeTrials(N_PRACTICE, 0.60, 0.50);
          const blockTL = buildBlockTimeline(trials, true, "practice", subjInfo);
          jsPsych.getCurrentTimelineNode().timeline = blockTL;
        }
      },

      // criterion check (if fail show fail page)
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
          const acc = computePracticeAcc();
          const pass = acc >= PASS_CRITERION;
          return `<div class="center-wrap" style="font-family:${FONT_FAMILY}">
            <div class="bigtext">练习正确率：${(acc*100).toFixed(1)}%</div>
            <div style="font-size:22px; margin-top:12px;">
              ${pass ? "已达标，将进入正式实验（按空格继续）。" : "未达标，将重新练习（按空格继续）。"}
            </div>
          </div>`;
        },
        choices: [' '],
        on_finish: (data) => {
          const acc = computePracticeAcc();
          data.practiceMeanAcc = acc;
          data.practicePass = acc >= PASS_CRITERION;
        }
      },

      // fail page only when not pass
      {
        timeline: [imagePage(INSTR.practice_fail)],
        conditional_function: () => {
          const last = jsPsych.data.get().last(1).values()[0];
          return last && last.practicePass === false;
        }
      }
    ],
    loop_function: () => {
      const last = jsPsych.data.get().last(1).values()[0];
      return last && last.practicePass === false;
    }
  });

  // Formal intro
  timeline.push(imagePage(INSTR.formal_intro));

  // Formal block 1
  timeline.push(connectingPage(CONNECT_MIN, CONNECT_MAX));
  timeline.push({
    timeline: [],
    on_start: () => {
      const subjInfo = {
        name: jsPsych.data.get().select("name").values[0],
        birthdate: jsPsych.data.get().select("birthdate").values[0],
        gender: jsPsych.data.get().select("gender").values[0],
        handedness: jsPsych.data.get().select("handedness").values[0],
      };
      const trials = makeTrials(N_BLOCK1, 0.60, 0.50);
      jsPsych.getCurrentTimelineNode().timeline = buildBlockTimeline(trials, false, "formalBlock1", subjInfo);
    }
  });

  // Break page
  timeline.push(imagePage(INSTR.break));

  // Formal block 2
  timeline.push(connectingPage(CONNECT_MIN, CONNECT_MAX));
  timeline.push({
    timeline: [],
    on_start: () => {
      const subjInfo = {
        name: jsPsych.data.get().select("name").values[0],
        birthdate: jsPsych.data.get().select("birthdate").values[0],
        gender: jsPsych.data.get().select("gender").values[0],
        handedness: jsPsych.data.get().select("handedness").values[0],
      };
      const trials = makeTrials(N_BLOCK2, 0.60, 0.50);
      jsPsych.getCurrentTimelineNode().timeline = buildBlockTimeline(trials, false, "formalBlock2", subjInfo);
    }
  });

  // End page
  timeline.push(imagePage(INSTR.end));

  // fullscreen off (optional)
  timeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false
  });

  // -----------------------------
  // Run
  // -----------------------------
  jsPsych.run(timeline);
})();
