// analysis.js
// Motor H2 v0.1 - determinístico, explicável e extensível
// ARARA - Laboratório de Versos Semióticos

// ==========================================
// CONFIG
// ==========================================

const TRAIL_RULES = {
  praia: {
    label: "Caminhada na Praia",
    minWords: 20,
    maxWords: 75,
    expectParagraphsMin: 1,
    expectParagraphsMax: 1
  },
  corrida: {
    label: "Corrida de Rua",
    minWords: 60,
    maxWords: 500,
    expectParagraphsMin: 3,
    expectParagraphsMax: 6
  },
  himalaias: {
    label: "Ultramaratona dos Himalaias",
    minWords: 100,
    maxWords: Infinity,
    expectParagraphsMin: 3,
    expectParagraphsMax: Infinity
  }
};

const GENRE_WEIGHTS = {
  artigo: {
    situacaoEscrita: 1.0, estrutura: 1.1, coesao: 1.1,
    argumentacao: 1.4, estilo: 0.9, curadoria: 1.2
  },
  dissertativo: {
    situacaoEscrita: 1.0, estrutura: 1.2, coesao: 1.2,
    argumentacao: 1.4, estilo: 0.8, curadoria: 1.2
  },
  relato: {
    situacaoEscrita: 1.2, estrutura: 1.1, coesao: 1.0,
    argumentacao: 0.7, estilo: 1.0, curadoria: 0.5
  },
  resenha: {
    situacaoEscrita: 1.0, estrutura: 1.1, coesao: 1.0,
    argumentacao: 1.2, estilo: 0.9, curadoria: 1.3
  },
  cronica: {
    situacaoEscrita: 1.0, estrutura: 1.0, coesao: 1.0,
    argumentacao: 0.8, estilo: 1.3, curadoria: 0.4
  }
};

const MARKERS = {
  introducao: [
    "primeiramente", "antes de tudo", "em primeiro lugar", "é importante",
    "é possível observar", "podemos perceber", "nos dias atuais"
  ],
  tese: [
    "defendo que", "considero que", "acredito que", "é necessário",
    "é fundamental", "é preciso", "sustento que", "entendo que"
  ],
  exemplificacao: [
    "por exemplo", "como", "tal como", "a exemplo de", "um caso disso"
  ],
  contraste: [
    "porém", "entretanto", "contudo", "todavia", "no entanto", "embora"
  ],
  causa: [
    "porque", "pois", "já que", "uma vez que", "devido a"
  ],
  conclusao: [
    "portanto", "assim", "logo", "em síntese", "em conclusão",
    "dessa forma", "desse modo", "conclui-se"
  ],
  modalizacao: [
    "talvez", "certamente", "possivelmente", "provavelmente", "sem dúvida",
    "é evidente", "parece", "pode", "deve"
  ],
  temporalidade: [
    "então", "depois", "antes", "naquele momento", "em seguida", "logo após"
  ],
  citacao: [
    "segundo", "de acordo com", "conforme", "para", "afirma", "argumenta"
  ]
};

const STOPWORDS = new Set([
  "a","o","e","de","do","da","dos","das","um","uma","uns","umas",
  "em","no","na","nos","nas","por","para","com","sem","que","se",
  "é","foi","ser","ao","à","às","os","as","ou","como"
]);

// ==========================================
// HELPERS
// ==========================================

function normalizeText(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function splitParagraphs(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
}

function splitSentences(text) {
  return (text || "")
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function tokenize(text) {
  return normalizeText(text)
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function countWords(text) {
  const t = (text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, n) => sum + n, 0) / arr.length;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function score1to5(raw100) {
  if (raw100 >= 85) return 5;
  if (raw100 >= 70) return 4;
  if (raw100 >= 50) return 3;
  if (raw100 >= 30) return 2;
  return 1;
}

function countMarkerOccurrences(text, markerList) {
  const normalized = normalizeText(text);
  let count = 0;
  const hits = [];
  for (const marker of markerList) {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("\\b" + escaped + "\\b", "g");
    const matches = normalized.match(regex);
    if (matches && matches.length) {
      count += matches.length;
      hits.push(marker);
    }
  }
  return { count, hits };
}

function lexicalStats(text) {
  const tokens = tokenize(text).filter(t => !STOPWORDS.has(t));
  const total = tokens.length;
  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  const unique = freq.size;
  const diversity = total ? unique / total : 0;
  const repeated = [...freq.entries()]
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return { total, unique, diversity, repeated };
}

function extractContextOverlap(text, fields) {
  const textNorm = normalizeText(text);
  const hits = [];
  for (const field of (fields || []).filter(Boolean)) {
    const fieldNorm = normalizeText(field);
    if (!fieldNorm) continue;
    const words = fieldNorm.split(/\s+/).filter(w => w.length >= 4);
    for (const w of words) {
      if (textNorm.includes(w) && !hits.includes(w)) hits.push(w);
    }
  }
  return hits;
}

// ==========================================
// DETECTORS
// ==========================================

function detectStructure(text) {
  const paragraphs = splitParagraphs(text);
  const intro = paragraphs[0] || "";
  const conclusion = paragraphs[paragraphs.length - 1] || "";
  const middle = paragraphs.slice(1, -1).join("\n\n");

  return {
    paragraphsCount: paragraphs.length,
    hasIntroduction: intro.length > 0,
    hasDevelopment: middle.length > 0 || paragraphs.length >= 2,
    hasConclusion: conclusion.length > 0,
    introHits: countMarkerOccurrences(intro, MARKERS.introducao),
    thesisHits: countMarkerOccurrences(text, MARKERS.tese),
    exampleHits: countMarkerOccurrences(text, MARKERS.exemplificacao),
    contrastHits: countMarkerOccurrences(text, MARKERS.contraste),
    conclusionHits: countMarkerOccurrences(conclusion, MARKERS.conclusao)
  };
}

function detectCohesion(text) {
  const connectors = [
    ...MARKERS.contraste, ...MARKERS.causa,
    ...MARKERS.conclusao, ...MARKERS.exemplificacao
  ];
  const result = countMarkerOccurrences(text, connectors);
  const unique = [...new Set(result.hits)];
  return { totalConnectors: result.count, uniqueConnectors: unique.length, connectorsFound: unique };
}

function detectArgumentation(text) {
  return {
    thesisCount: countMarkerOccurrences(text, MARKERS.tese).count,
    thesisHits: countMarkerOccurrences(text, MARKERS.tese).hits,
    exampleCount: countMarkerOccurrences(text, MARKERS.exemplificacao).count,
    exampleHits: countMarkerOccurrences(text, MARKERS.exemplificacao).hits,
    contrastCount: countMarkerOccurrences(text, MARKERS.contraste).count,
    contrastHits: countMarkerOccurrences(text, MARKERS.contraste).hits,
    causeCount: countMarkerOccurrences(text, MARKERS.causa).count,
    causeHits: countMarkerOccurrences(text, MARKERS.causa).hits,
    conclusionCount: countMarkerOccurrences(text, MARKERS.conclusao).count,
    conclusionHits: countMarkerOccurrences(text, MARKERS.conclusao).hits
  };
}

function detectStyle(text) {
  const stats = lexicalStats(text);
  const modal = countMarkerOccurrences(text, MARKERS.modalizacao);
  const sentences = splitSentences(text);
  const sentenceLengths = sentences.map(s => countWords(s));
  return {
    lexicalDiversity: stats.diversity,
    repeatedTerms: stats.repeated,
    modalizationCount: modal.count,
    modalizationHits: modal.hits,
    avgSentenceLength: average(sentenceLengths),
    longSentences: sentenceLengths.filter(n => n > 35).length,
    shortSentences: sentenceLengths.filter(n => n > 0 && n < 4).length
  };
}

function detectCuration(text) {
  const citation = countMarkerOccurrences(text, MARKERS.citacao);
  return {
    citationCount: citation.count,
    citationHits: citation.hits,
    hasQuotes: /["""]/.test(text),
    hasLink: /(https?:\/\/|www\.)/i.test(text),
    hasYear: /\b(19|20)\d{2}\b/.test(text),
    hasPercent: /\b\d+(\,\d+)?%/.test(text),
    hasNumericData: /\b\d+\b/.test(text)
  };
}

// ==========================================
// SCORE BUILDERS
// ==========================================

function scoreSituacaoEscrita({ text, genre, theme, objective, interlocutor }) {
  let raw = 0;
  const evidence = [];
  if (genre)       { raw += 20; evidence.push("Gênero informado: " + genre); }
  if (theme)       { raw += 20; evidence.push("Tema informado"); }
  if (objective)   { raw += 20; evidence.push("Objetivo informado"); }
  if (interlocutor){ raw += 20; evidence.push("Interlocutor informado"); }
  const overlap = extractContextOverlap(text, [theme, objective, interlocutor]);
  if (overlap.length >= 3)      { raw += 20; evidence.push("Aderência textual: " + overlap.join(", ")); }
  else if (overlap.length >= 1) { raw += 10; evidence.push("Alguma aderência ao contexto: " + overlap.join(", ")); }
  return { raw: clamp(raw, 0, 100), evidence };
}

function scoreEstrutura({ text, trail }) {
  const structure = detectStructure(text);
  const rule = TRAIL_RULES[trail] || TRAIL_RULES.corrida;
  let raw = 0;
  const evidence = [];
  if (structure.hasIntroduction) raw += 15;
  if (structure.hasDevelopment)  raw += 20;
  if (structure.hasConclusion)   raw += 15;
  if (structure.introHits.count > 0) {
    raw += 10; evidence.push("Marcadores de abertura: " + structure.introHits.hits.join(", "));
  }
  if (structure.conclusionHits.count > 0) {
    raw += 15; evidence.push("Marcadores de fechamento: " + structure.conclusionHits.hits.join(", "));
  }
  const p = structure.paragraphsCount;
  if (p >= rule.expectParagraphsMin && p <= rule.expectParagraphsMax) {
    raw += 25; evidence.push("Parágrafos adequados à trilha: " + p);
  } else if (p >= 1) {
    raw += 10; evidence.push("Quantidade de parágrafos ainda frágil para a trilha: " + p);
  }
  return { raw: clamp(raw, 0, 100), evidence, structure };
}

function scoreCoesao({ text }) {
  const cohesion = detectCohesion(text);
  let raw = 0;
  const evidence = [];
  if (cohesion.totalConnectors >= 4)      raw += 35;
  else if (cohesion.totalConnectors >= 2) raw += 20;
  else if (cohesion.totalConnectors >= 1) raw += 10;
  if (cohesion.uniqueConnectors >= 4)      raw += 35;
  else if (cohesion.uniqueConnectors >= 2) raw += 20;
  else if (cohesion.uniqueConnectors >= 1) raw += 10;
  if (cohesion.connectorsFound.length) {
    evidence.push("Conectores encontrados: " + cohesion.connectorsFound.join(", "));
  }
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length >= 2) { raw += 20; evidence.push("Há encadeamento potencial entre parágrafos"); }
  const sentences = splitSentences(text);
  const avgLen = average(sentences.map(s => countWords(s)));
  if (avgLen >= 8 && avgLen <= 28) { raw += 10; evidence.push("Extensão média de frase equilibrada"); }
  return { raw: clamp(raw, 0, 100), evidence, cohesion };
}

function scoreArgumentacao({ text, genre }) {
  const arg = detectArgumentation(text);
  let raw = 0;
  const evidence = [];
  if (arg.thesisCount > 0)   { raw += 25; evidence.push("Indício de tese: " + arg.thesisHits.join(", ")); }
  if (arg.causeCount > 0)    { raw += 20; evidence.push("Marcas de justificativa: " + arg.causeHits.join(", ")); }
  if (arg.exampleCount > 0)  { raw += 20; evidence.push("Exemplificação: " + arg.exampleHits.join(", ")); }
  if (arg.contrastCount > 0) { raw += 15; evidence.push("Contraste/ressalva: " + arg.contrastHits.join(", ")); }
  if (arg.conclusionCount > 0){ raw += 20; evidence.push("Conclusão provável: " + arg.conclusionHits.join(", ")); }
  if (genre === "relato" || genre === "cronica") raw = Math.min(raw, 80);
  return { raw: clamp(raw, 0, 100), evidence, arg };
}

function scoreEstilo({ text }) {
  const style = detectStyle(text);
  let raw = 50;
  const evidence = [];
  if (style.lexicalDiversity >= 0.65)      { raw += 20; evidence.push("Boa diversidade lexical"); }
  else if (style.lexicalDiversity >= 0.5)  { raw += 10; evidence.push("Diversidade lexical suficiente"); }
  else                                     { raw -= 10; evidence.push("Diversidade lexical baixa"); }
  if (style.modalizationCount > 0) {
    raw += 10; evidence.push("Modalização presente: " + style.modalizationHits.join(", "));
  }
  if (style.longSentences > 2) { raw -= 10; evidence.push("Muitas frases longas"); }
  if (style.shortSentences > 2){ raw -= 10; evidence.push("Muitas frases excessivamente curtas"); }
  if (style.repeatedTerms.length > 0) {
    raw -= 10;
    evidence.push("Repetições fortes: " + style.repeatedTerms.map(([t, n]) => t + "(" + n + ")").join(", "));
  }
  return { raw: clamp(raw, 0, 100), evidence, style };
}

function scoreCuradoria({ text, genre }) {
  const cur = detectCuration(text);
  let raw = 0;
  const evidence = [];
  if (cur.citationCount > 0) { raw += 30; evidence.push("Marcas de referência: " + cur.citationHits.join(", ")); }
  if (cur.hasQuotes)         { raw += 15; evidence.push("Uso de aspas"); }
  if (cur.hasLink)           { raw += 20; evidence.push("Link/fonte explícita"); }
  if (cur.hasYear)           { raw += 10; evidence.push("Ano citado"); }
  if (cur.hasPercent || cur.hasNumericData) { raw += 15; evidence.push("Dados numéricos presentes"); }
  if (genre === "cronica" || genre === "relato") raw = Math.min(raw, 70);
  return { raw: clamp(raw, 0, 100), evidence, cur };
}

// ==========================================
// WARNINGS & REVISION
// ==========================================

function buildWarnings({ text, trail, structure, cohesion, arg }) {
  const warnings = [];
  const words = countWords(text);
  const rule = TRAIL_RULES[trail] || TRAIL_RULES.corrida;
  if (words < rule.minWords) warnings.push("Texto abaixo do mínimo esperado para a trilha " + rule.label + ".");
  if (words > rule.maxWords) warnings.push("Texto acima do limite da trilha " + rule.label + ".");
  if (structure.paragraphsCount < rule.expectParagraphsMin) warnings.push("Quantidade de parágrafos abaixo do esperado para a trilha.");
  if (cohesion.totalConnectors === 0) warnings.push("Não foram detectados conectores relevantes.");
  if (arg.thesisCount === 0 && (trail === "corrida" || trail === "himalaias")) warnings.push("Não há indício claro de tese ou posicionamento.");
  if (arg.conclusionCount === 0 && trail !== "praia") warnings.push("Não foi detectado fechamento conclusivo claro.");
  return warnings;
}

function buildRevisionFocus(scores) {
  return Object.entries(scores)
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 2)
    .map(([key, value]) => ({
      axis: key,
      score: value.score,
      prompt: revisionPromptByAxis(key, value.score)
    }));
}

function revisionPromptByAxis(axis, score) {
  const prompts = {
    situacaoEscrita: "Reforce para quem você escreve, com qual objetivo e em qual gênero.",
    estrutura: "Reorganize abertura, desenvolvimento e fechamento para dar progressão ao texto.",
    coesao: "Acrescente conectores variados para ligar melhor frases e parágrafos.",
    argumentacao: "Explicite melhor sua tese e acrescente razão, exemplo ou contra-argumento.",
    estilo: "Revise repetições e refine o vocabulário sem perder clareza.",
    curadoria: "Incorpore referência, dado, autor ou evidência quando o gênero pedir sustentação."
  };
  if (score >= 4) return "Este eixo está consistente; refine detalhes finos.";
  return prompts[axis] || "Revise este eixo na próxima versão.";
}

// ==========================================
// MAIN ANALYZER (global — sem ES modules)
// ==========================================

function analyzeTextDeterministic({ text, mode, genre, trail, theme, objective, interlocutor }) {
  const safeText = (text || "").trim();

  if (!safeText) {
    return {
      ok: false, error: "Texto vazio.", summary: null, scores: null,
      evidence: null, warnings: ["Não há conteúdo para analisar."], revisionFocus: []
    };
  }

  const words      = countWords(safeText);
  const paragraphs = splitParagraphs(safeText).length;
  const sentences  = splitSentences(safeText).length;

  const situacao    = scoreSituacaoEscrita({ text: safeText, genre, theme, objective, interlocutor });
  const estrutura   = scoreEstrutura({ text: safeText, trail });
  const coesao      = scoreCoesao({ text: safeText });
  const argumentacao= scoreArgumentacao({ text: safeText, genre });
  const estilo      = scoreEstilo({ text: safeText });
  const curadoria   = scoreCuradoria({ text: safeText, genre });

  const weights = GENRE_WEIGHTS[genre] || GENRE_WEIGHTS.dissertativo;

  const weightedScores = {
    situacaoEscrita: { raw: situacao.raw,     score: score1to5(situacao.raw     * weights.situacaoEscrita) },
    estrutura:       { raw: estrutura.raw,     score: score1to5(estrutura.raw    * weights.estrutura) },
    coesao:          { raw: coesao.raw,        score: score1to5(coesao.raw       * weights.coesao) },
    argumentacao:    { raw: argumentacao.raw,  score: score1to5(argumentacao.raw * weights.argumentacao) },
    estilo:          { raw: estilo.raw,        score: score1to5(estilo.raw       * weights.estilo) },
    curadoria:       { raw: curadoria.raw,     score: score1to5(curadoria.raw    * weights.curadoria) }
  };

  const warnings = buildWarnings({
    text: safeText, trail,
    structure: estrutura.structure,
    cohesion: coesao.cohesion,
    arg: argumentacao.arg
  });

  const revisionFocus = buildRevisionFocus(weightedScores);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const overallRaw = (
    weightedScores.situacaoEscrita.raw * weights.situacaoEscrita +
    weightedScores.estrutura.raw       * weights.estrutura +
    weightedScores.coesao.raw          * weights.coesao +
    weightedScores.argumentacao.raw    * weights.argumentacao +
    weightedScores.estilo.raw          * weights.estilo +
    weightedScores.curadoria.raw       * weights.curadoria
  ) / totalWeight;

  return {
    ok: true,
    summary: { mode, genre, trail, words, paragraphs, sentences, overallScore: score1to5(overallRaw) },
    scores: weightedScores,
    evidence: {
      situacaoEscrita: situacao.evidence,
      estrutura: estrutura.evidence,
      coesao: coesao.evidence,
      argumentacao: argumentacao.evidence,
      estilo: estilo.evidence,
      curadoria: curadoria.evidence
    },
    diagnostics: {
      structure: estrutura.structure,
      cohesion: coesao.cohesion,
      argumentation: argumentacao.arg,
      style: estilo.style,
      curation: curadoria.cur
    },
    warnings,
    revisionFocus
  };
}
