/************************************************************
 * ARARA - Laboratorio de Versos Semioticos - v2.6.0
 ************************************************************/

// ====== CONFIGURE AQUI ======
const CONFIG = {
  FORM_ID: "1Y6b_jSyNZ7ypke_C3tr8-1VHBFzGjaIVAzy4Qxne3R4",
  TEMPLATE_DOC_ID: "1MinVOws5zBjlghIjCyNH-RKS8v7Z88CUFMVl-4fseNI",
  OUTPUT_FOLDER_ID: "1w3MvYyEX39eFcBNTYmQUeYLvKiJuWndN",

  // Planilha do Forms usada para registrar sucesso e erro.
  LOG_SSID: "1E4rnhvbJUNmFXXZn_IduDEqzottgmIZxadQWyWuhqaU",
  LOG_SHEET_NAME: "Registro_PDFs",

  // Fonte da base poetica.
  // Base ativa em Google Sheets.
  POEMS_SSID: "1pIauTcsi_G8Z_-528TRrOXtx7Hpri8tZaOc801ai6yY",
  POEMS_SHEET_NAME: "POEMS",
  POEMS_ROTATION_PARTS: 5,

  SENDER_NAME: "Cordel 2.0 - ARARA"
};

const PROP_COUNTER = "LV_V25_COUNTER";
const PROP_POEM_ROTATION_INDEX = "ARARA_POEM_ROTATION_INDEX";
const PROP_INVITE_ROTATION_INDEX = "ARARA_INVITE_ROTATION_INDEX";
const LOG_HEADERS = [
  "Data/Hora",
  "Status",
  "Status E-mail",
  "Contador",
  "Nome",
  "E-mail",
  "Sentimento",
  "Substantivo",
  "Adjetivos",
  "Ambiente",
  "Verso Gerado",
  "Trecho Poetico",
  "Autor Referencia",
  "Titulo Referencia",
  "Parte Rotativa",
  "Coincidencias",
  "Link do PDF",
  "Erro"
];

const POEM_REQUIRED_HEADERS = [
  "AUTHOR",
  "TITLE",
  "CONTENT",
  "NORM_CONTENT",
  "NOUNS",
  "VERBS",
  "ADJECTIVES",
  "BIGRAMS"
];

const STOPWORDS = {
  a: true, ao: true, aos: true, as: true, com: true, da: true, das: true, de: true, do: true,
  dos: true, e: true, em: true, entre: true, eu: true, la: true, lhe: true, mas: true, me: true,
  meu: true, minha: true, na: true, nas: true, nem: true, no: true, nos: true, o: true, os: true,
  ou: true, para: true, por: true, porque: true, que: true, se: true, sem: true, sob: true, sua: true,
  suas: true, seu: true, seus: true, teu: true, tua: true, tuas: true, um: true, uma: true, umas: true,
  uns: true, vai: true, vem: true
};

const CONVITE_CRIACAO_VARIANTS = [
  "Agora, escreva o seu proprio verso. Deixe o sentir aparecer por meio das imagens do mundo: um objeto, um gesto, um lugar. Se quiser, use conectores sutis, como quando, entre, como, mas, porque ou apesar de.",
  "Agora e a sua vez de escrever. Faca o sentir emergir nas imagens do cotidiano: um objeto, um gesto, um lugar. Para aproxima-las, experimente conectores delicados, como quando, entre, como ou porque.",
  "Escreva agora o seu proprio verso. Deixe que a emocao tome forma em imagens do mundo: um objeto, um gesto, um lugar. Voce pode uni-las com palavras como entre, quando, mas ou apesar de.",
  "Agora, componha o seu verso. Procure no mundo uma imagem que carregue o que voce sente: um objeto, um gesto, um lugar. Se quiser, costure essas imagens com conectores suaves.",
  "E a sua vez de escrever. Deixe o sentir passar pelas imagens do cotidiano: um objeto, um gesto, um lugar. Use, se desejar, conectores sutis para dar passagem ao verso.",
  "Agora, escreva o seu verso autoral. Faca o sentir aparecer em imagens simples do mundo: um objeto, um gesto, um lugar. Para ligar uma imagem a outra, experimente quando, como, entre ou porque.",
  "Escreva um verso a partir do que pulsa em voce. Deixe que esse sentir se transforme em imagem: um objeto, um gesto, um lugar. Se quiser, aproxime as palavras com conectores discretos.",
  "Agora, transforme o sentir em verso. Busque imagens do mundo para dar corpo ao que vibra: um objeto, um gesto, um lugar. Voce pode usar conectores delicados para criar passagem entre elas.",
  "Escreva o seu proprio verso. Permita que o sentir se revele por imagens do mundo comum: um objeto, um gesto, um lugar. Se desejar, use conectores suaves para fazer o verso respirar.",
  "Agora e tempo de criar. Deixe o sentir se insinuar em imagens concretas: um objeto, um gesto, um lugar. Para unir essas presencas, experimente conectores como quando, mas ou apesar de.",
  "Escreva agora o seu verso. De forma ao sentir com imagens do mundo: um objeto, um gesto, um lugar. Se quiser, use conectores sutis para criar uma pequena travessia entre elas.",
  "Agora, faca nascer o seu verso. Deixe o que voce sente pousar sobre imagens do cotidiano: um objeto, um gesto, um lugar. Conectores suaves podem ajudar a aproximar essas imagens.",
  "E a sua vez de inventar um verso. Procure no mundo uma imagem para o que voce sente: um objeto, um gesto, um lugar. Se desejar, costure essas imagens com palavras de passagem.",
  "Agora, escreva um verso seu. Deixe o sentir aparecer aos poucos, por meio de imagens do mundo: um objeto, um gesto, um lugar. Use conectores sutis se quiser dar mais movimento ao texto.",
  "Escreva o seu proprio verso e deixe o sentir tomar forma em imagens simples: um objeto, um gesto, um lugar. Para aproxima-las, voce pode recorrer a conectores delicados.",
  "Agora, experimente escrever a partir do que sente. Faca esse sentir passar por uma imagem do mundo: um objeto, um gesto, um lugar. Se quiser, ligue as imagens com conectores suaves.",
  "E a sua vez de continuar. Deixe que o sentir encontre imagem em um objeto, em um gesto, em um lugar. Use conectores sutis para criar relacao entre as palavras, se desejar.",
  "Agora, escreva. Deixe o sentir se mostrar em imagens do cotidiano: um objeto, um gesto, um lugar. Voce pode aproxima-las com palavras como quando, como, entre ou porque.",
  "Escreva o seu verso. Procure uma forma de fazer o sentir aparecer no mundo visivel: um objeto, um gesto, um lugar. Se quiser, use conectores discretos para dar continuidade ao movimento.",
  "Agora, de ao sentir uma forma de linguagem. Deixe-o surgir em imagens do mundo: um objeto, um gesto, um lugar. Se desejar, una essas imagens com conectores leves.",
  "Agora e sua vez de criar um verso. Faca o sentir aparecer por imagens concretas: um objeto, um gesto, um lugar. Para liga-las, experimente conectores sutis e quase silenciosos.",
  "Escreva agora o seu proprio verso. Deixe o que voce sente ganhar corpo em imagens do cotidiano: um objeto, um gesto, um lugar. Se quiser, use conectores para encadear delicadamente essas imagens.",
  "Agora, crie o seu verso. Deixe o sentir se traduzir em imagens do mundo ao redor: um objeto, um gesto, um lugar. Voce pode aproxima-las com conectores discretos, como quando ou apesar de.",
  "Escreva um verso seu a partir do que sente. Faca esse sentir aparecer em imagens simples e precisas: um objeto, um gesto, um lugar. Se desejar, use conectores suaves para compor o fluxo.",
  "Agora, deixe o seu verso acontecer. Permita que o sentir encontre imagem em um objeto, um gesto ou um lugar. Se quiser, costure essas imagens com conectores delicados, quase como quem sussurra."
];

const FIELD_MATCHERS = {
  email: ["e-mail", "email", "correio eletronico"],
  ambienteOutro: ["outro lugar", "outro espaco", "qual outro lugar", "qual outro espaco"],
  versoUser: [
    "continue a imagem",
    "verso autoral",
    "seu verso",
    "escreva seu proprio verso",
    "escreva o seu verso"
  ],
  sentimento: ["sentimento", "sentir"],
  substantivo: ["substantivo", "objeto", "coisa"],
  adjetivos: ["adjetivo", "adjetivos", "qualidades"],
  ambiente: ["lugar cotidiano", "ambiente", "lugar", "espaco"],
  nome: ["nome"]
};

// ====== CONFIGURAR FORM ======
function configureExistingForm() {
  if (!CONFIG.FORM_ID) throw new Error("Preencha CONFIG.FORM_ID");
  if (!CONFIG.TEMPLATE_DOC_ID) throw new Error("Preencha CONFIG.TEMPLATE_DOC_ID");
  if (!CONFIG.OUTPUT_FOLDER_ID) throw new Error("Preencha CONFIG.OUTPUT_FOLDER_ID");

  installTriggerForForm(CONFIG.FORM_ID);
  ensureLogSheet_();
  configurePoemsSheet();

  if (!PropertiesService.getScriptProperties().getProperty(PROP_COUNTER)) {
    PropertiesService.getScriptProperties().setProperty(PROP_COUNTER, "0");
  }

  if (!PropertiesService.getScriptProperties().getProperty(PROP_INVITE_ROTATION_INDEX)) {
    PropertiesService.getScriptProperties().setProperty(PROP_INVITE_ROTATION_INDEX, "-1");
  }

  Logger.log("Configurado com sucesso para a planilha do Forms.");
}

function configurePoemsSheet() {
  if (!CONFIG.POEMS_SSID) {
    throw new Error("Preencha CONFIG.POEMS_SSID com o ID da Google Sheet de poemas.");
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.POEMS_SSID);
  const sheet = spreadsheet.getSheetByName(CONFIG.POEMS_SHEET_NAME);

  if (!sheet) {
    throw new Error(
      'Aba de poemas nao encontrada. Verifique CONFIG.POEMS_SHEET_NAME. Valor atual: "' +
      CONFIG.POEMS_SHEET_NAME +
      '".'
    );
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    throw new Error("A planilha de poemas esta vazia.");
  }

  const headerRow = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const headerMap = buildHeaderMap_(headerRow);
  validatePoemHeaders_(headerMap);

  sheet.setFrozenRows(1);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty(PROP_POEM_ROTATION_INDEX)) {
    props.setProperty(PROP_POEM_ROTATION_INDEX, "-1");
  }

  Logger.log(
    'Planilha de poemas configurada com sucesso. Aba "' +
    sheet.getName() +
    '" com ' +
    Math.max(0, lastRow - 1) +
    " poemas e rotacao em " +
    CONFIG.POEMS_ROTATION_PARTS +
    " partes."
  );
}

function reconfigureLogSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.LOG_SSID);
  let sh = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
  }

  const currentLastColumn = Math.max(sh.getLastColumn(), LOG_HEADERS.length);
  const currentLastRow = sh.getLastRow();
  const existingValues = currentLastRow
    ? sh.getRange(1, 1, currentLastRow, currentLastColumn).getDisplayValues()
    : [];

  if (currentLastRow > 0) {
    const backupName = buildLogBackupSheetName_();
    sh.copyTo(ss).setName(backupName);
  }

  const migratedRows = [];
  if (existingValues.length > 1) {
    for (let i = 1; i < existingValues.length; i++) {
      const normalized = normalizeLegacyLogRow_(existingValues[i]);
      if (normalized) {
        migratedRows.push(normalized);
      }
    }
  }

  sh.clearContents();

  if (sh.getMaxColumns() < LOG_HEADERS.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), LOG_HEADERS.length - sh.getMaxColumns());
  }

  if (sh.getMaxColumns() > LOG_HEADERS.length) {
    sh.deleteColumns(LOG_HEADERS.length + 1, sh.getMaxColumns() - LOG_HEADERS.length);
  }

  sh.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
  sh.getRange(1, 1, 1, LOG_HEADERS.length).setFontWeight("bold");
  sh.setFrozenRows(1);

  if (migratedRows.length) {
    sh.getRange(2, 1, migratedRows.length, LOG_HEADERS.length).setValues(migratedRows);
    sh.autoResizeColumns(1, LOG_HEADERS.length);
  }

  Logger.log(
    'Aba de log reconfigurada com sucesso: "' +
    CONFIG.LOG_SHEET_NAME +
    '" com ' +
    migratedRows.length +
    " registros."
  );

  return {
    ok: true,
    sheetName: CONFIG.LOG_SHEET_NAME,
    rows: migratedRows.length,
    columns: sh.getLastColumn()
  };
}

function buildLogBackupSheetName_() {
  return "Registro_PDFs_backup_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
}

function normalizeLegacyLogRow_(row) {
  const trimmed = trimTrailingEmptyCells_(row);
  if (!trimmed.length || trimmed.every(cell => !cleanAnswerText_(cell))) {
    return null;
  }

  const timestamp = trimmed[0] || "";
  const second = cleanAnswerText_(trimmed[1]);
  const third = cleanAnswerText_(trimmed[2]);
  const fourth = cleanAnswerText_(trimmed[3]);
  const hasStatus = /^(OK|ERRO)$/i.test(second);
  const hasEmailStatus = /^(ENVIADO|SEM_EMAIL|NAO_ENVIADO)$/i.test(third);
  const currentStyle = hasStatus && (hasEmailStatus || looksLikeCounter_(fourth));

  if (!hasStatus) {
    return padLogRow_([
      timestamp,
      "",
      "",
      "",
      trimmed[1] || "-",
      trimmed[2] || "-",
      "",
      "",
      "",
      "",
      trimmed[3] || "-",
      "",
      "",
      "",
      "",
      "",
      trimmed[4] || "-",
      ""
    ]);
  }

  if (currentStyle) {
    return padLogRow_([
      timestamp,
      trimmed[1] || "",
      hasEmailStatus ? trimmed[2] || "" : "",
      hasEmailStatus ? trimmed[3] || "" : trimmed[3] || "",
      hasEmailStatus ? trimmed[4] || "-" : trimmed[4] || "-",
      hasEmailStatus ? trimmed[5] || "-" : trimmed[5] || "-",
      hasEmailStatus ? trimmed[6] || "-" : trimmed[6] || "-",
      hasEmailStatus ? trimmed[7] || "-" : trimmed[7] || "-",
      hasEmailStatus ? trimmed[8] || "-" : trimmed[8] || "-",
      hasEmailStatus ? trimmed[9] || "-" : trimmed[9] || "-",
      hasEmailStatus ? trimmed[10] || "-" : trimmed[10] || "-",
      hasEmailStatus ? trimmed[11] || "-" : trimmed[11] || "-",
      hasEmailStatus ? trimmed[12] || "-" : trimmed[12] || "-",
      hasEmailStatus ? trimmed[13] || "-" : trimmed[13] || "-",
      hasEmailStatus ? trimmed[14] || "-" : trimmed[14] || "-",
      hasEmailStatus ? trimmed[15] || "-" : trimmed[15] || "-",
      hasEmailStatus ? trimmed[16] || "-" : trimmed[16] || "-",
      hasEmailStatus ? trimmed[17] || "" : trimmed[17] || ""
    ]);
  }

  return padLogRow_([
    timestamp,
    trimmed[1] || "",
    "",
    trimmed[2] || "",
    trimmed[3] || "-",
    trimmed[4] || "-",
    trimmed[5] || "-",
    trimmed[6] || "-",
    trimmed[7] || "-",
    trimmed[8] || "-",
    trimmed[9] || "-",
    trimmed[10] || "-",
    trimmed[11] || "-",
    trimmed[12] || "-",
    "",
    "",
    trimmed[13] || "-",
    trimmed[14] || ""
  ]);
}

function trimTrailingEmptyCells_(row) {
  const copy = row.slice();
  while (copy.length && !cleanAnswerText_(copy[copy.length - 1])) {
    copy.pop();
  }
  return copy;
}

function padLogRow_(row) {
  const copy = row.slice(0, LOG_HEADERS.length);
  while (copy.length < LOG_HEADERS.length) {
    copy.push("");
  }
  return copy;
}

function looksLikeCounter_(value) {
  return /^\d+$/.test(cleanAnswerText_(value));
}

function diagnoseTemplateDoc(templateId) {
  const docId = String(templateId || CONFIG.TEMPLATE_DOC_ID || "").trim();
  if (!docId) {
    throw new Error("Informe um templateId ou configure CONFIG.TEMPLATE_DOC_ID.");
  }

  const report = {
    templateId: docId,
    checkedAt: formatTimestamp_(new Date(), "dd/MM/yyyy HH:mm:ss"),
    file: {},
    placeholders: {},
    labels: {},
    warnings: []
  };

  const file = DriveApp.getFileById(docId);
  report.file.name = file.getName();
  report.file.mimeType = file.getMimeType();
  report.file.isGoogleDoc = file.getMimeType() === MimeType.GOOGLE_DOCS;

  if (!report.file.isGoogleDoc) {
    report.warnings.push("O template nao esta em formato Google Docs nativo.");
  }

  const doc = DocumentApp.openById(docId);
  const bodyText = doc.getBody().getText();
  const header = doc.getHeader();
  const footer = doc.getFooter();
  const headerText = header ? header.getText() : "";
  const footerText = footer ? footer.getText() : "";
  const fullText = [bodyText, headerText, footerText].filter(Boolean).join("\n");

  const expectedPlaceholders = [
    "{{NUMERO}}",
    "{{DATA_HORA}}",
    "{{NOME}}",
    "{{SENTIMENTO}}",
    "{{SUBSTANTIVO}}",
    "{{ADJETIVOS}}",
    "{{AMBIENTE}}",
    "{{VERSO_USUARIO}}",
    "{{CONVITE_CRIACAO}}",
    "{{EMAIL}}",
    "{{FRAGMENTO_POETICO}}",
    "{{AUTOR_REFERENCIA}}",
    "{{TITULO_REFERENCIA}}"
  ];

  expectedPlaceholders.forEach(token => {
    report.placeholders[token] = fullText.indexOf(token) !== -1;
    if (!report.placeholders[token]) {
      report.warnings.push("Placeholder ausente: " + token);
    }
  });

  const optionalOrLegacyChecks = {
    "{{VERSO_GERADO}}": "Placeholder legado de imagem sugerida ainda presente.",
    "Imagem sugerida": "Rotulo antigo 'Imagem sugerida' ainda presente.",
    "Substantivo": "Rotulo 'Substantivo' nao encontrado.",
    "Seu verso autoral": "Rotulo 'Seu verso autoral' nao encontrado.",
    "Convite à criação": "Rotulo 'Convite à criação' nao encontrado.",
    "Convite a criação": "Rotulo 'Convite a criação' nao encontrado.",
    "Convite a criacao": "Rotulo 'Convite a criacao' nao encontrado."
  };

  report.labels.substantivo = fullText.indexOf("Substantivo") !== -1;
  report.labels.versoAutoral = fullText.indexOf("Seu verso autoral") !== -1;
  report.labels.conviteCriacao =
    fullText.indexOf("Convite à criação") !== -1 ||
    fullText.indexOf("Convite a criação") !== -1 ||
    fullText.indexOf("Convite a criacao") !== -1;
  report.labels.imagemSugerida = fullText.indexOf("Imagem sugerida") !== -1;

  if (fullText.indexOf("{{VERSO_GERADO}}") !== -1) {
    report.warnings.push(optionalOrLegacyChecks["{{VERSO_GERADO}}"]);
  }
  if (report.labels.imagemSugerida) {
    report.warnings.push(optionalOrLegacyChecks["Imagem sugerida"]);
  }
  if (!report.labels.substantivo) {
    report.warnings.push(optionalOrLegacyChecks["Substantivo"]);
  }
  if (!report.labels.versoAutoral) {
    report.warnings.push(optionalOrLegacyChecks["Seu verso autoral"]);
  }
  if (!report.labels.conviteCriacao) {
    report.warnings.push(optionalOrLegacyChecks["Convite a criacao"]);
  }

  report.bodyLength = bodyText.length;
  report.headerLength = headerText.length;
  report.footerLength = footerText.length;

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function testTemplateRender_() {
  const now = new Date();
  const contador = incrementarContadorSeguro_();
  const referenciaPoetica = {
    fragmento: "E urgente o amor. E urgente um barco no mar.",
    autor: "Eugenio de Andrade",
    titulo: "E urgente o amor",
    score: 999,
    termosCoincidentes: ["amor", "mar"],
    parteRotativa: "teste"
  };

  const data = {
    templateId: CONFIG.TEMPLATE_DOC_ID,
    contador: contador,
    dataStr: formatTimestamp_(now, "dd/MM/yyyy HH:mm"),
    nome: "Carlos",
    sentimento: "espanto",
    substantivo: "janela",
    adjetivos: "densa, azul",
    ambiente: "amazonia",
    versoGerado: "A janela densa entre amazonia",
    versoUser: "Escrevo entre rios como quem aprende a escutar a luz.",
    conviteCriacao: getRotatingConviteCriacao_(),
    email: "cjaviervidalg@gmail.com",
    referenciaPoetica: referenciaPoetica
  };

  const docId = preencherTemplateV25_(data);
  Utilities.sleep(1500);

  const docFile = DriveApp.getFileById(docId);
  const folder = DriveApp.getFolderById(CONFIG.OUTPUT_FOLDER_ID);
  const pdfBlob = docFile
    .getAs(MimeType.PDF)
    .setName(buildOutputFileName_(contador, "teste_template_arara"));

  docFile.moveTo(folder);
  const pdfFile = folder.createFile(pdfBlob);

  MailApp.sendEmail({
    to: "cjaviervidalg@gmail.com",
    subject: "Teste de renderizacao do template - ARARA",
    htmlBody:
      '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">' +
      "<h2>Teste do template ARARA</h2>" +
      "<p>Este envio foi gerado manualmente para verificar o preenchimento do template.</p>" +
      "<p><b>Substantivo:</b> janela</p>" +
      "<p><b>Verso autoral:</b> Escrevo entre rios como quem aprende a escutar a luz.</p>" +
      "</div>",
    attachments: [pdfBlob],
    name: CONFIG.SENDER_NAME
  });

  const result = {
    ok: true,
    contador: contador,
    docId: docId,
    pdfUrl: pdfFile.getUrl(),
    sentTo: "cjaviervidalg@gmail.com"
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

// ====== TRIGGER ======
function installTriggerForForm(formId) {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === "onFormSubmit_V25_Poetico") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("onFormSubmit_V25_Poetico")
    .forForm(FormApp.openById(formId))
    .onFormSubmit()
    .create();
}

// ====== ON SUBMIT ======
function onFormSubmit_V25_Poetico(e) {
  const startedAt = new Date();
  const submission = createEmptySubmission_();
  let contador = "";
  let versoGerado = "";
  let pdfUrl = "";
  let referenciaPoetica = createEmptyPoeticReference_();
  let conviteCriacao = "";
  let emailStatus = "NAO_ENVIADO";

  try {
    if (!e || !e.response) {
      throw new Error("Evento de formulario invalido ou ausente.");
    }

    Object.assign(submission, extractSubmissionData_(e.response));
    versoGerado = construirVersoPoeticoV25_(submission.substantivo, submission.adjetivos, submission.ambiente);
    referenciaPoetica = findPoeticReference_(submission);
    conviteCriacao = getRotatingConviteCriacao_();
    contador = incrementarContadorSeguro_();

    const docId = preencherTemplateV25_({
      templateId: CONFIG.TEMPLATE_DOC_ID,
      contador: contador,
      dataStr: formatTimestamp_(startedAt, "dd/MM/yyyy HH:mm"),
      nome: submission.nome,
      sentimento: submission.sentimento,
      substantivo: submission.substantivo,
      adjetivos: submission.adjetivos,
      ambiente: submission.ambiente,
      versoGerado: versoGerado,
      versoUser: submission.versoUser,
      email: submission.email,
      referenciaPoetica: referenciaPoetica,
      conviteCriacao: conviteCriacao
    });

    // Aguarda um pouco para o Drive consolidar a copia antes da exportacao em PDF.
    Utilities.sleep(1200);

    const docFile = DriveApp.getFileById(docId);
    const folder = DriveApp.getFolderById(CONFIG.OUTPUT_FOLDER_ID);
    const pdfBlob = docFile
      .getAs(MimeType.PDF)
      .setName(buildOutputFileName_(contador, submission.nome || submission.substantivo || "verso"));

    docFile.moveTo(folder);

    const pdfFile = folder.createFile(pdfBlob);
    pdfUrl = pdfFile.getUrl();

    if (submission.email) {
      MailApp.sendEmail({
        to: submission.email,
        subject: "Sua imagem virou verso - ARARA",
        htmlBody: buildEmailPoeticoHtmlV25_({
          nome: submission.nome,
          referenciaPoetica: referenciaPoetica,
          contador: contador,
          whenStr: formatTimestamp_(startedAt, "dd/MM/yyyy HH:mm")
        }),
        attachments: [pdfBlob],
        name: CONFIG.SENDER_NAME
      });
      emailStatus = "ENVIADO";
    } else {
      emailStatus = "SEM_EMAIL";
    }

    safeAppendLogRow_({
      timestamp: startedAt,
      status: "OK",
      emailStatus: emailStatus,
      contador: contador,
      nome: submission.nome,
      email: submission.email,
      sentimento: submission.sentimento,
      substantivo: submission.substantivo,
      adjetivos: submission.adjetivos,
      ambiente: submission.ambiente,
      versoGerado: versoGerado,
      trechoPoetico: referenciaPoetica.fragmento || "[sem coincidencia nesta rodada]",
      autorReferencia: referenciaPoetica.autor,
      tituloReferencia: referenciaPoetica.titulo,
      parteRotativa: referenciaPoetica.parteRotativa,
      coincidencias: (referenciaPoetica.termosCoincidentes || []).join(", "),
      pdfUrl: pdfUrl,
      error: ""
    });
  } catch (err) {
    safeAppendLogRow_({
      timestamp: startedAt,
      status: "ERRO",
      emailStatus: emailStatus,
      contador: contador,
      nome: submission.nome,
      email: submission.email,
      sentimento: submission.sentimento,
      substantivo: submission.substantivo,
      adjetivos: submission.adjetivos,
      ambiente: submission.ambiente,
      versoGerado: versoGerado,
      trechoPoetico: referenciaPoetica.fragmento,
      autorReferencia: referenciaPoetica.autor,
      tituloReferencia: referenciaPoetica.titulo,
      parteRotativa: referenciaPoetica.parteRotativa,
      coincidencias: (referenciaPoetica.termosCoincidentes || []).join(", "),
      pdfUrl: pdfUrl,
      error: truncate_(formatError_(err), 1000)
    });

    console.error("Erro no envio do formulario: " + formatError_(err));
    throw err;
  }
}

// ====== LEITURA DAS RESPOSTAS ======
function createEmptySubmission_() {
  return {
    nome: "",
    sentimento: "",
    substantivo: "",
    adjetivos: "",
    ambiente: "",
    ambienteOutro: "",
    versoUser: "",
    email: ""
  };
}

function extractSubmissionData_(formResponse) {
  const submission = createEmptySubmission_();
  submission.email = cleanAnswerText_(formResponse.getRespondentEmail());

  formResponse.getItemResponses().forEach(itemResponse => {
    const key = identifyFieldKey_(itemResponse.getItem().getTitle());
    if (!key) return;

    const answer = cleanAnswerText_(itemResponse.getResponse());
    if (!answer) return;

    if (key === "email" && submission.email) return;
    submission[key] = answer;
  });

  if (normalizeText_(submission.ambiente).indexOf("outro") !== -1 && submission.ambienteOutro) {
    submission.ambiente = submission.ambienteOutro;
  }

  return submission;
}

function identifyFieldKey_(title) {
  const normalizedTitle = normalizeText_(title);
  const orderedKeys = [
    "email",
    "ambienteOutro",
    "versoUser",
    "substantivo",
    "sentimento",
    "adjetivos",
    "ambiente",
    "nome"
  ];

  for (let i = 0; i < orderedKeys.length; i++) {
    const key = orderedKeys[i];
    const aliases = FIELD_MATCHERS[key] || [];
    for (let j = 0; j < aliases.length; j++) {
      if (normalizedTitle.indexOf(normalizeText_(aliases[j])) !== -1) {
        return key;
      }
    }
  }

  return "";
}

function cleanAnswerText_(answer) {
  if (Array.isArray(answer)) {
    return answer.map(item => cleanAnswerText_(item)).filter(Boolean).join(", ");
  }

  if (answer === null || answer === undefined) {
    return "";
  }

  return String(answer).replace(/\s+/g, " ").trim();
}

function normalizeText_(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ====== HEURISTICA ======
function construirVersoPoeticoV25_(substantivo, adjetivos, ambiente) {
  const substantivoLimpo = cleanAnswerText_(substantivo).toLowerCase();
  const ambienteLimpo = cleanAnswerText_(ambiente).replace(/^o |^a /i, "").toLowerCase();
  const listaAdj = cleanAnswerText_(adjetivos)
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
  const adjetivo = listaAdj[0] || "";

  const conectores = ["na", "no", "entre", "sob", "diante de", "ao lado de"];
  const conector = conectores[Math.floor(Math.random() * conectores.length)];
  const baseSubstantivo = substantivoLimpo || "gesto";
  const baseAmbiente = ambienteLimpo || "algum lugar";
  const artigo = /^[aeiou]/i.test(baseSubstantivo) ? "Um" : "O";
  const miolo = [artigo, baseSubstantivo, adjetivo, conector, baseAmbiente].filter(Boolean).join(" ");
  const versoBase = miolo.replace(/\s+/g, " ").trim();
  const variacao = Math.random();

  if (variacao < 0.2) {
    return [artigo, baseSubstantivo, adjetivo + ",", conector, baseAmbiente]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (variacao < 0.3) {
    return [cap_(conector), baseAmbiente + ",", artigo.toLowerCase(), baseSubstantivo, adjetivo]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return versoBase || "Um verso em estado de rascunho";
}

// ====== TEMPLATE ======
function preencherTemplateV25_(data) {
  const src = DriveApp.getFileById(data.templateId);
  const copy = src.makeCopy(buildDocName_(data.contador, data.nome || data.substantivo || "verso"));
  const doc = openDocumentWithRetry_(copy.getId());

  const replacements = {
    "{{NUMERO}}": String(data.contador || ""),
    "{{DATA_HORA}}": data.dataStr || "-",
    "{{NOME}}": data.nome || "-",
    "{{SENTIMENTO}}": data.sentimento || "-",
    "{{SUBSTANTIVO}}": data.substantivo || "-",
    "{{ADJETIVOS}}": data.adjetivos || "-",
    "{{AMBIENTE}}": data.ambiente || "-",
    "{{VERSO_GERADO}}": data.versoGerado || "-",
    "{{VERSO_USUARIO}}": data.versoUser || "-",
    "{{CONVITE_CRIACAO}}": data.conviteCriacao || "-",
    "{{EMAIL}}": data.email || "-",
    "{{FRAGMENTO_POETICO}}": data.referenciaPoetica.fragmento || "-",
    "{{AUTOR_REFERENCIA}}": data.referenciaPoetica.autor || "-",
    "{{TITULO_REFERENCIA}}": data.referenciaPoetica.titulo || "-"
  };

  Object.keys(replacements).forEach(token => {
    replaceTokenEverywhere_(doc, token, replacements[token]);
  });

  cleanupTemplateSections_(doc);
  ensureFallbackFieldInPdf_(doc, "Substantivo", data.substantivo);
  appendPoeticReferenceSection_(doc, data.referenciaPoetica);
  doc.saveAndClose();
  return copy.getId();
}

function openDocumentWithRetry_(docId) {
  const maxAttempts = 5;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return DocumentApp.openById(docId);
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        Utilities.sleep(1200 * attempt);
      }
    }
  }

  throw new Error(
    "Nao foi possivel abrir o documento copiado no Google Docs apos " +
    maxAttempts +
    " tentativas. Verifique se o template e um Google Docs nativo e se a conta do Apps Script tem acesso de edicao. Erro original: " +
    formatError_(lastError)
  );
}

function replaceTokenEverywhere_(doc, token, value) {
  const replacement = escapeReplacementText_(value);
  const pattern = escapeRegex_(token);

  doc.getBody().replaceText(pattern, replacement);

  const header = doc.getHeader();
  if (header) {
    header.replaceText(pattern, replacement);
  }

  const footer = doc.getFooter();
  if (footer) {
    footer.replaceText(pattern, replacement);
  }
}

function cleanupTemplateSections_(doc) {
  const body = doc.getBody();
  body.replaceText("(?i)Imagem sugerida", "");
  body.replaceText(escapeRegex_("{{VERSO_GERADO}}"), "");
  removeParagraphByText_(body, /^imagem sugerida$/i);
  removeParagraphByText_(body, /^\{\{VERSO_GERADO\}\}$/i);
}

function ensureFallbackFieldInPdf_(doc, label, value) {
  const cleanValue = cleanAnswerText_(value);
  if (!cleanValue) return;

  const body = doc.getBody();
  const bodyText = normalizeText_(body.getText());
  if (bodyText.indexOf(normalizeText_(cleanValue)) !== -1) {
    return;
  }

  body.appendParagraph(label).setBold(true);
  body.appendParagraph(cleanValue);
}

function removeParagraphByText_(body, pattern) {
  for (let i = body.getNumChildren() - 1; i >= 0; i--) {
    const child = body.getChild(i);
    if (child.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;

    const paragraph = child.asParagraph();
    const text = paragraph.getText().replace(/\s+/g, " ").trim();
    if (pattern.test(text)) {
      body.removeChild(child);
    }
  }
}

// ====== EMAIL ======
function buildEmailPoeticoHtmlV25_(payload) {
  const esc = value =>
    String(value || "").replace(/[&<>"']/g, match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[match]));

  return (
    '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">' +
      "<h2>Sua imagem virou verso - ARARA</h2>" +
      "<p>" +
        (payload.nome ? "Ola, <b>" + esc(payload.nome) + "</b>. " : "") +
        "Sua sintese foi registrada em <b>" + esc(payload.whenStr) + "</b>." +
      "</p>" +
      "<p>Obrigado por participar e por compartilhar o seu gesto de escrita com o ARARA.</p>" +
      buildEmailPoeticReferenceHtml_(payload.referenciaPoetica, esc) +
      "<p>Seu PDF esta em anexo (Sintese #" + esc(payload.contador) + ").</p>" +
      '<p style="color:#666">Continue escrevendo. As imagens mudam, os versos tambem.<br/>Se quiser, responda este e-mail com uma nova versao do seu texto.</p>' +
    "</div>"
  );
}

function buildEmailPoeticReferenceHtml_(referenciaPoetica, esc) {
  if (!referenciaPoetica || !referenciaPoetica.fragmento) {
    return "";
  }

  const origem = [referenciaPoetica.titulo, referenciaPoetica.autor].filter(Boolean).join(" - ");
  return (
    '<div style="margin:18px 0;padding:14px 16px;background:#f7f4ee;border-left:4px solid #ff8a00;border-radius:8px">' +
      '<p style="margin:0 0 8px;font-size:13px;color:#6b6258"><b>Ressonancia poetica encontrada na sua escrita</b></p>' +
      '<p style="margin:0 0 8px;font-size:15px"><i>&ldquo;' + esc(referenciaPoetica.fragmento) + '&rdquo;</i></p>' +
      (origem ? '<p style="margin:0;font-size:13px;color:#6b6258">' + esc(origem) + "</p>" : "") +
    "</div>"
  );
}

// ====== LOG NA PLANILHA DO FORMS ======
function ensureLogSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.LOG_SSID);
  let sh = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
  }

  ensureLogHeaders_(sh);
  return sh;
}

function ensureLogHeaders_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, LOG_HEADERS.length);
  const existing = headerRange.getDisplayValues()[0];
  const needsUpdate = LOG_HEADERS.some((header, index) => existing[index] !== header);

  if (needsUpdate) {
    headerRange.setValues([LOG_HEADERS]);
    headerRange.setFontWeight("bold");
  }

  sheet.setFrozenRows(1);
}

function appendLogRow_(entry) {
  const sh = ensureLogSheet_();
  sh.appendRow([
    formatTimestamp_(entry.timestamp, "dd/MM/yyyy HH:mm:ss"),
    entry.status || "",
    entry.emailStatus || "",
    entry.contador || "",
    entry.nome || "-",
    entry.email || "-",
    entry.sentimento || "-",
    entry.substantivo || "-",
    entry.adjetivos || "-",
    entry.ambiente || "-",
    entry.versoGerado || "-",
    entry.trechoPoetico || "-",
    entry.autorReferencia || "-",
    entry.tituloReferencia || "-",
    entry.parteRotativa || "-",
    entry.coincidencias || "-",
    entry.pdfUrl || "-",
    entry.error || ""
  ]);
}

function safeAppendLogRow_(entry) {
  try {
    appendLogRow_(entry);
  } catch (logError) {
    console.error("Falha ao registrar log: " + formatError_(logError));
  }
}

// ====== COUNTER ======
function incrementarContadorSeguro_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const props = PropertiesService.getScriptProperties();
    let n = parseInt(props.getProperty(PROP_COUNTER), 10);
    if (!Number.isFinite(n)) n = 0;

    n += 1;
    props.setProperty(PROP_COUNTER, String(n));
    return n;
  } finally {
    lock.releaseLock();
  }
}

// ====== REFERENCIA POETICA ======
function createEmptyPoeticReference_() {
  return {
    fragmento: "",
    autor: "",
    titulo: "",
    score: 0,
    termosCoincidentes: [],
    parteRotativa: ""
  };
}

function findPoeticReference_(submission) {
  try {
    const query = buildPoemQuery_(submission);
    if (!query.tokens.length) {
      return createEmptyPoeticReference_();
    }

    const poems = loadPoemRows_();
    if (!poems.length) {
      return createEmptyPoeticReference_();
    }

    const rotation = getRotatingPoemSlice_(poems, CONFIG.POEMS_ROTATION_PARTS);
    const poemsToScan = rotation.poems;
    let bestMatch = null;

    for (let i = 0; i < poemsToScan.length; i++) {
      const poem = poemsToScan[i];
      const candidate = scorePoemMatch_(poem, query);
      if (!candidate) continue;
      candidate.parteRotativa = rotation.label;
      if (!bestMatch || candidate.score > bestMatch.score) {
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      return bestMatch;
    }

    const emptyReference = createEmptyPoeticReference_();
    emptyReference.parteRotativa = rotation.label;
    return emptyReference;
  } catch (err) {
    console.error("Falha ao localizar referencia poetica: " + formatError_(err));
    return createEmptyPoeticReference_();
  }
}

function getRotatingPoemSlice_(poems, totalParts) {
  const safeParts = Math.max(1, Number(totalParts) || 1);
  if (safeParts === 1 || poems.length <= safeParts) {
    return {
      poems: poems,
      index: 0,
      totalParts: 1,
      label: "1/1"
    };
  }

  const rotationIndex = nextPoemRotationIndex_(safeParts);
  const selected = [];

  for (let i = 0; i < poems.length; i++) {
    if (i % safeParts === rotationIndex) {
      selected.push(poems[i]);
    }
  }

  return {
    poems: selected.length ? selected : poems,
    index: rotationIndex,
    totalParts: safeParts,
    label: String(rotationIndex + 1) + "/" + String(safeParts)
  };
}

function nextPoemRotationIndex_(totalParts) {
  return nextRotationPropertyIndex_(PROP_POEM_ROTATION_INDEX, totalParts);
}

function buildPoemQuery_(submission) {
  const rawParts = [
    submission.sentimento,
    submission.substantivo,
    submission.adjetivos,
    submission.ambiente,
    submission.versoUser
  ].filter(Boolean);

  const normalized = normalizeText_(rawParts.join(" "));
  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .filter(token => token && token.length > 2 && !STOPWORDS[token]);

  const uniqueTokens = [];
  const seen = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (seen[token]) continue;
    seen[token] = true;
    uniqueTokens.push(token);
  }

  const bigrams = [];
  for (let i = 0; i < uniqueTokens.length - 1; i++) {
    bigrams.push(uniqueTokens[i] + " " + uniqueTokens[i + 1]);
  }

  return {
    rawText: rawParts.join(" ").trim(),
    tokens: uniqueTokens,
    bigrams: bigrams
  };
}

function loadPoemRows_() {
  return CONFIG.POEMS_SSID ? loadPoemsFromSheet_() : [];
}

function loadPoemsFromSheet_() {
  const sh = SpreadsheetApp.openById(CONFIG.POEMS_SSID).getSheetByName(CONFIG.POEMS_SHEET_NAME);
  if (!sh) {
    throw new Error("Aba de poemas nao encontrada: " + CONFIG.POEMS_SHEET_NAME);
  }

  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headerMap = buildHeaderMap_(values[0]);
  validatePoemHeaders_(headerMap);

  const poems = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const poem = mapPoemRow_(row, headerMap);
    if (poem.content) {
      poems.push(poem);
    }
  }

  return poems;
}

function buildHeaderMap_(headerRow) {
  const map = {};
  for (let i = 0; i < headerRow.length; i++) {
    const key = normalizeHeaderName_(headerRow[i]);
    if (key) {
      map[key] = i;
    }
  }
  return map;
}

function normalizeHeaderName_(value) {
  return String(value || "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_");
}

function validatePoemHeaders_(headerMap) {
  const missing = POEM_REQUIRED_HEADERS.filter(header => headerMap[header] === undefined);
  if (missing.length) {
    throw new Error("Colunas obrigatorias ausentes na base poetica: " + missing.join(", "));
  }
}

function mapPoemRow_(row, headerMap) {
  return {
    author: cleanAnswerText_(row[headerMap.AUTHOR]),
    title: cleanAnswerText_(row[headerMap.TITLE]),
    content: cleanPoemContent_(row[headerMap.CONTENT]),
    normContent: normalizeText_(row[headerMap.NORM_CONTENT]),
    nouns: splitPipeValues_(row[headerMap.NOUNS]),
    verbs: splitPipeValues_(row[headerMap.VERBS]),
    adjectives: splitPipeValues_(row[headerMap.ADJECTIVES]),
    bigrams: splitPipeValues_(row[headerMap.BIGRAMS])
  };
}

function splitPipeValues_(value) {
  return cleanAnswerText_(value)
    .split("|")
    .map(item => normalizeText_(item))
    .filter(Boolean);
}

function cleanPoemContent_(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function scorePoemMatch_(poem, query) {
  const nounMap = arrayToLookup_(poem.nouns);
  const verbMap = arrayToLookup_(poem.verbs);
  const adjectiveMap = arrayToLookup_(poem.adjectives);
  const bigramMap = arrayToLookup_(poem.bigrams);
  let score = 0;
  const matchedTerms = [];
  const matchedMap = {};

  for (let i = 0; i < query.tokens.length; i++) {
    const token = query.tokens[i];
    let tokenScore = 0;

    if (nounMap[token]) tokenScore = Math.max(tokenScore, 4);
    if (verbMap[token]) tokenScore = Math.max(tokenScore, 3);
    if (adjectiveMap[token]) tokenScore = Math.max(tokenScore, 3);
    if (containsWholeWord_(poem.normContent, token)) tokenScore = Math.max(tokenScore, 1);

    if (tokenScore > 0) {
      score += tokenScore;
      if (!matchedMap[token]) {
        matchedMap[token] = true;
        matchedTerms.push(token);
      }
    }
  }

  for (let i = 0; i < query.bigrams.length; i++) {
    const bigram = query.bigrams[i];
    if (bigramMap[bigram] || poem.normContent.indexOf(bigram) !== -1) {
      score += 5;
      if (!matchedMap[bigram]) {
        matchedMap[bigram] = true;
        matchedTerms.push(bigram);
      }
    }
  }

  if (matchedTerms.length >= 2) {
    score += matchedTerms.length;
  }

  if (score <= 0) {
    return null;
  }

  return {
    fragmento: extractPoemFragment_(poem, query),
    autor: poem.author,
    titulo: poem.title,
    score: score,
    termosCoincidentes: matchedTerms
  };
}

function extractPoemFragment_(poem, query) {
  const lines = String(poem.content || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return "";
  }

  let bestIndex = 0;
  let bestScore = -1;

  for (let i = 0; i < lines.length; i++) {
    const normalizedLine = normalizeText_(lines[i]);
    let lineScore = 0;

    for (let j = 0; j < query.tokens.length; j++) {
      if (containsWholeWord_(normalizedLine, query.tokens[j])) {
        lineScore += 2;
      }
    }

    for (let j = 0; j < query.bigrams.length; j++) {
      if (normalizedLine.indexOf(query.bigrams[j]) !== -1) {
        lineScore += 4;
      }
    }

    if (lineScore > bestScore) {
      bestScore = lineScore;
      bestIndex = i;
    }
  }

  const fragmentLines = [lines[bestIndex]];
  if (bestIndex + 1 < lines.length && (fragmentLines[0] + " " + lines[bestIndex + 1]).length <= 320) {
    fragmentLines.push(lines[bestIndex + 1]);
  }

  return fragmentLines.join("\n");
}

function appendPoeticReferenceSection_(doc, referenciaPoetica) {
  if (!referenciaPoetica || !referenciaPoetica.fragmento) {
    return;
  }

  const body = doc.getBody();
  body.appendPageBreak();
  body.appendParagraph("Ressonancia poetica").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('"' + referenciaPoetica.fragmento + '"').setItalic(true);

  const attribution = [referenciaPoetica.titulo, referenciaPoetica.autor].filter(Boolean).join(" - ");
  if (attribution) {
    body.appendParagraph(attribution);
  }

  if (referenciaPoetica.termosCoincidentes && referenciaPoetica.termosCoincidentes.length) {
    body.appendParagraph("Coincidencias de termos: " + referenciaPoetica.termosCoincidentes.slice(0, 6).join(", "));
  }
}

function arrayToLookup_(items) {
  const lookup = {};
  for (let i = 0; i < items.length; i++) {
    lookup[items[i]] = true;
  }
  return lookup;
}

function containsWholeWord_(text, token) {
  return new RegExp("(^|[^a-z0-9])" + escapeRegex_(token) + "([^a-z0-9]|$)").test(String(text || ""));
}

// ====== CONVITE A CRIACAO ======
function getRotatingConviteCriacao_() {
  if (!CONVITE_CRIACAO_VARIANTS.length) {
    return "";
  }

  const index = nextRotationPropertyIndex_(PROP_INVITE_ROTATION_INDEX, CONVITE_CRIACAO_VARIANTS.length);
  return CONVITE_CRIACAO_VARIANTS[index] || CONVITE_CRIACAO_VARIANTS[0];
}

function nextRotationPropertyIndex_(propertyName, totalItems) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const props = PropertiesService.getScriptProperties();
    const current = parseInt(props.getProperty(propertyName), 10);
    const safeCurrent = Number.isFinite(current) ? current : -1;
    const next = (safeCurrent + 1) % Math.max(1, totalItems);
    props.setProperty(propertyName, String(next));
    return next;
  } finally {
    lock.releaseLock();
  }
}

// ====== HELPERS ======
function formatTimestamp_(dateObj, pattern) {
  return Utilities.formatDate(dateObj || new Date(), Session.getScriptTimeZone(), pattern);
}

function buildDocName_(contador, baseName) {
  return "ARARA_Sintese_" + String(contador).padStart(4, "0") + "_" + slug_(baseName);
}

function buildOutputFileName_(contador, baseName) {
  return buildDocName_(contador, baseName) + ".pdf";
}

function escapeRegex_(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeReplacementText_(text) {
  return String(text || "").replace(/\$/g, "$$$$");
}

function formatError_(err) {
  if (!err) return "Erro desconhecido";
  if (err.stack) return err.stack;
  if (err.message) return err.message;
  return String(err);
}

function truncate_(value, maxLength) {
  const text = String(value || "");
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - 3)) + "...";
}

function cap_(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function slug_(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "verso";
}
