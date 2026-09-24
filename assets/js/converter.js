/**
 * converter.js – Acadex File Converter
 * All conversions happen 100 % client-side. No file data leaves the browser.
 */

/* ─────────────────────────────────────────────────
   CDN library URLs  (loaded lazily when first needed)
───────────────────────────────────────────────────── */
const LIB = {
  pdfjs:       'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  tesseract:   'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js',
  mammoth:     'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
};

/* ─────────────────────────────────────────────────
   Format catalogue
───────────────────────────────────────────────────── */
const FORMATS = [
  {
    id: 'pdf-text',
    name: 'PDF → Text',
    desc: 'Extract embedded text from PDF',
    accept: '.pdf',
    ext: 'txt',
    mime: 'text/plain',
  },
  {
    id: 'pdf-ocr',
    name: 'PDF → Text (OCR)',
    desc: 'Scanned or image-based PDFs',
    accept: '.pdf',
    ext: 'txt',
    mime: 'text/plain',
    ocr: true,
  },
  {
    id: 'img-ocr',
    name: 'Image → Text (OCR)',
    desc: 'JPG, PNG, TIFF, WebP to plain text',
    accept: '.jpg,.jpeg,.png,.tiff,.tif,.bmp,.webp',
    ext: 'txt',
    mime: 'text/plain',
    ocr: true,
  },
  {
    id: 'docx-text',
    name: 'DOCX → Text',
    desc: 'Word document to plain text',
    accept: '.docx',
    ext: 'txt',
    mime: 'text/plain',
  },
  {
    id: 'csv-json',
    name: 'CSV → JSON',
    desc: 'Spreadsheet rows to JSON array',
    accept: '.csv',
    ext: 'json',
    mime: 'application/json',
  },
  {
    id: 'json-csv',
    name: 'JSON → CSV',
    desc: 'JSON array to CSV spreadsheet',
    accept: '.json',
    ext: 'csv',
    mime: 'text/csv',
  },
  {
    id: 'txt-md',
    name: 'Text → Markdown',
    desc: 'Plain text to structured Markdown',
    accept: '.txt',
    ext: 'md',
    mime: 'text/markdown',
  },
];

/* ─────────────────────────────────────────────────
   DOM references
───────────────────────────────────────────────────── */
const grid         = document.getElementById('format-grid');
const dropWrap     = document.getElementById('drop-wrap');
const convDrop     = document.getElementById('conv-drop');
const fileInput    = document.getElementById('conv-file-input');
const dropNote     = document.getElementById('conv-drop-note');
const progressEl   = document.getElementById('conv-progress');
const progressFill = document.getElementById('progress-fill');
const progressLbl  = document.getElementById('progress-label');
const resultEl     = document.getElementById('conv-result');
const outputEl     = document.getElementById('conv-output');
const dlBtn        = document.getElementById('conv-download');
const copyBtn      = document.getElementById('conv-copy');
const resetBtn     = document.getElementById('conv-reset');
const statusEl     = document.getElementById('conv-status');

let selectedFmt = null;
let resultText  = '';
let resultBlob  = null;

/* ─────────────────────────────────────────────────
   Build the format selection grid
───────────────────────────────────────────────────── */
FORMATS.forEach(fmt => {
  const btn = document.createElement('button');
  btn.className = 'fmt-btn';
  btn.dataset.id = fmt.id;
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');

  btn.innerHTML = `
    ${fmt.ocr ? '<span class="ocr-badge">OCR</span>' : ''}
    <span class="fmt-name">${fmt.name}</span>
    <span class="fmt-desc">${fmt.desc}</span>
  `;

  btn.addEventListener('click', () => selectFormat(fmt));
  grid.appendChild(btn);
});

function selectFormat(fmt) {
  selectedFmt = fmt;

  grid.querySelectorAll('.fmt-btn').forEach(b => {
    const sel = b.dataset.id === fmt.id;
    b.classList.toggle('sel', sel);
    b.setAttribute('aria-pressed', String(sel));
  });

  fileInput.accept = fmt.accept;

  dropNote.textContent =
    `Accepts: ${fmt.accept.replace(/,/g, ', ')} · or click to browse`;

  dropWrap.classList.remove('hidden');

  resetResult();
}

/* ─────────────────────────────────────────────────
   Drag & drop
───────────────────────────────────────────────────── */
convDrop.addEventListener('dragover', e => {
  e.preventDefault();
  convDrop.classList.add('over');
});

convDrop.addEventListener('dragleave', () => {
  convDrop.classList.remove('over');
});

convDrop.addEventListener('drop', e => {
  e.preventDefault();
  convDrop.classList.remove('over');

  const file = e.dataTransfer.files[0];

  if (file) {
    handleFile(file);
  }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) {
    handleFile(fileInput.files[0]);
  }
});

/* ─────────────────────────────────────────────────
   Main conversion dispatcher
───────────────────────────────────────────────────── */
async function handleFile(file) {
  if (!selectedFmt) {
    setStatus('Please choose a conversion format first.');
    return;
  }

  resetResult();
  showProgress(0, 'Reading file…');

  try {
    let text = '';

    switch (selectedFmt.id) {
      case 'pdf-text':
        text = await pdfToText(file);
        break;

      case 'pdf-ocr':
        text = await pdfOcr(file);
        break;

      case 'img-ocr':
        text = await imgOcr(file);
        break;

      case 'docx-text':
        text = await docxToText(file);
        break;

      case 'csv-json':
        text = await csvToJson(file);
        break;

      case 'json-csv':
        text = await jsonToCsv(file);
        break;

      case 'txt-md':
        text = await txtToMd(file);
        break;

      default:
        throw new Error('Unknown conversion format.');
    }

    showResult(text, file.name);

  } catch (err) {
    hideProgress();
    setStatus('⚠ ' + err.message);
    console.error(err);
  }
}

/* ─────────────────────────────────────────────────
   Lazy external script loader
───────────────────────────────────────────────────── */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');

    script.src = src;

    script.onload = () => resolve();

    script.onerror = () => {
      reject(new Error(`Could not load library: ${src}`));
    };

    document.head.appendChild(script);
  });
}

/* ─────────────────────────────────────────────────
   PDF → Text
───────────────────────────────────────────────────── */
async function pdfToText(file) {
  showProgress(5, 'Loading PDF library…');

  await loadScript(LIB.pdfjs);

  const pdfjsLib = window['pdfjs-dist/build/pdf'];

  pdfjsLib.GlobalWorkerOptions.workerSrc = LIB.pdfjsWorker;

  const buf = await file.arrayBuffer();

  showProgress(15, 'Parsing PDF…');

  const pdf = await pdfjsLib.getDocument({
    data: buf
  }).promise;

  const total = pdf.numPages;

  let out = '';

  for (let i = 1; i <= total; i++) {
    showProgress(
      15 + ((i - 1) / total) * 80,
      `Extracting text from page ${i} of ${total}…`
    );

    const page = await pdf.getPage(i);

    const content = await page.getTextContent();

    const text = content.items
      .map(item => item.str)
      .join(' ')
      .replace(/ {2,}/g, ' ');

    out += `\n\n— Page ${i} —\n\n${text}`;
  }

  showProgress(100, 'Done.');

  return out.trim();
}

/* ─────────────────────────────────────────────────
   PDF → Text OCR
───────────────────────────────────────────────────── */
async function pdfOcr(file) {
  showProgress(3, 'Loading PDF + OCR libraries…');

  await Promise.all([
    loadScript(LIB.pdfjs),
    loadScript(LIB.tesseract),
  ]);

  const pdfjsLib = window['pdfjs-dist/build/pdf'];

  pdfjsLib.GlobalWorkerOptions.workerSrc = LIB.pdfjsWorker;

  const buf = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: buf
  }).promise;

  const total = pdf.numPages;

  showProgress(8, 'Initialising OCR engine…');

  const worker = await Tesseract.createWorker('eng', 1, {
    logger: () => {},
  });

  let out = '';

  for (let i = 1; i <= total; i++) {
    const base = ((i - 1) / total) * 85;

    showProgress(
      base + 10,
      `Rendering page ${i} of ${total}…`
    );

    const page = await pdf.getPage(i);

    const viewport = page.getViewport({
      scale: 2.5
    });

    const canvas = document.createElement('canvas');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport
    }).promise;

    showProgress(
      base + 14,
      `Running OCR on page ${i} of ${total}…`
    );

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    const {
      data: {
        text
      }
    } = await worker.recognize(blob);

    out += `\n\n— Page ${i} —\n\n${text.trim()}`;
  }

  await worker.terminate();

  showProgress(100, 'Done.');

  return out.trim();
}

/* ─────────────────────────────────────────────────
   Image → Text OCR
───────────────────────────────────────────────────── */
async function imgOcr(file) {
  showProgress(5, 'Loading OCR engine…');

  await loadScript(LIB.tesseract);

  showProgress(12, 'Initialising Tesseract…');

  const worker = await Tesseract.createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        const progress = Math.round(m.progress * 100);

        showProgress(
          15 + Math.round(m.progress * 80),
          `Recognising text… ${progress}%`
        );
      }
    },
  });

  const url = URL.createObjectURL(file);

  const {
    data: {
      text
    }
  } = await worker.recognize(url);

  URL.revokeObjectURL(url);

  await worker.terminate();

  showProgress(100, 'Done.');

  return text.trim();
}

/* ─────────────────────────────────────────────────
   DOCX → Text
───────────────────────────────────────────────────── */
async function docxToText(file) {
  showProgress(10, 'Loading Word parser…');

  await loadScript(LIB.mammoth);

  showProgress(40, 'Extracting text…');

  const buf = await file.arrayBuffer();

  const result = await mammoth.extractRawText({
    arrayBuffer: buf
  });

  if (result.messages.length) {
    console.warn(
      'Mammoth messages:',
      result.messages
    );
  }

  showProgress(100, 'Done.');

  return result.value.trim();
}

/* ─────────────────────────────────────────────────
   CSV → JSON
───────────────────────────────────────────────────── */
async function csvToJson(file) {
  showProgress(20, 'Reading CSV…');

  const raw = await file.text();

  const lines = raw
    .split(/\r?\n/)
    .filter(line => line.trim() !== '');

  if (!lines.length) {
    throw new Error(
      'File appears to be empty.'
    );
  }

  function parseRow(row) {
    const cols = [];

    let current = '';
    let insideQuote = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        if (
          insideQuote &&
          row[i + 1] === '"'
        ) {
          current += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      }

      else if (
        char === ',' &&
        !insideQuote
      ) {
        cols.push(current);

        current = '';
      }

      else {
        current += char;
      }
    }

    cols.push(current);

    return cols.map(col => col.trim());
  }

  showProgress(50, 'Building JSON…');

  const headers = parseRow(lines[0]);

  const rows = lines
    .slice(1)
    .map(line => {
      const values = parseRow(line);

      const object = {};

      headers.forEach((header, index) => {
        object[header] =
          values[index] !== undefined
            ? values[index]
            : '';
      });

      return object;
    });

  showProgress(100, 'Done.');

  return JSON.stringify(
    rows,
    null,
    2
  );
}

/* ─────────────────────────────────────────────────
   JSON → CSV
───────────────────────────────────────────────────── */
async function jsonToCsv(file) {
  showProgress(20, 'Reading JSON…');

  const raw = await file.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      'Could not parse JSON — is the file valid?'
    );
  }

  if (!Array.isArray(data)) {
    throw new Error(
      'JSON must be an array of objects at the top level.'
    );
  }

  if (!data.length) {
    throw new Error(
      'JSON array is empty.'
    );
  }

  showProgress(50, 'Building CSV…');

  const keys = [
    ...new Set(
      data.flatMap(object =>
        Object.keys(object)
      )
    )
  ];

  function escapeCsv(value) {
    const string =
      value === null ||
      value === undefined
        ? ''
        : String(value);

    if (
      string.includes(',') ||
      string.includes('"') ||
      string.includes('\n')
    ) {
      return `"${string.replace(/"/g, '""')}"`;
    }

    return string;
  }

  const csvRows = [
    keys
      .map(escapeCsv)
      .join(','),

    ...data.map(row =>
      keys
        .map(key =>
          escapeCsv(row[key])
        )
        .join(',')
    )
  ];

  showProgress(100, 'Done.');

  return csvRows.join('\n');
}

/* ─────────────────────────────────────────────────
   Text → Markdown
───────────────────────────────────────────────────── */
async function txtToMd(file) {
  showProgress(20, 'Reading text…');

  const raw = await file.text();

  const lines = raw.split(/\r?\n/);

  const out = [];

  showProgress(50, 'Converting…');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const trimmed = line.trim();

    if (!trimmed) {
      out.push('');
      continue;
    }

    /*
     ALL CAPS short line becomes
     Markdown heading.
    */
    if (
      trimmed === trimmed.toUpperCase() &&
      /[A-Z]/.test(trimmed) &&
      trimmed.length <= 70 &&
      !/^\d/.test(trimmed)
    ) {
      out.push(`## ${trimmed}`);
      continue;
    }

    /* Numbered lists */
    if (/^\d+[\.\)]\s+/.test(trimmed)) {
      out.push(trimmed);
      continue;
    }

    /* Bullets */
    if (/^[-*•]\s+/.test(trimmed)) {
      out.push(
        `- ${trimmed.slice(
          trimmed.indexOf(' ') + 1
        )}`
      );

      continue;
    }

    out.push(line);
  }

  showProgress(100, 'Done.');

  return out.join('\n');
}

/* ─────────────────────────────────────────────────
   Progress UI
───────────────────────────────────────────────────── */
function showProgress(pct, label) {
  progressEl.classList.add('show');

  progressFill.style.width =
    `${Math.min(100, pct)}%`;

  progressFill.setAttribute(
    'aria-valuenow',
    String(
      Math.round(
        Math.min(100, pct)
      )
    )
  );

  progressLbl.textContent = label;

  resultEl.classList.remove('show');
}

function hideProgress() {
  progressEl.classList.remove('show');

  progressFill.style.width = '0%';

  progressFill.setAttribute(
    'aria-valuenow',
    '0'
  );
}

/* ─────────────────────────────────────────────────
   Show conversion result
───────────────────────────────────────────────────── */
function showResult(
  text,
  originalName
) {
  resultText = text;

  hideProgress();

  resultEl.classList.add('show');

  const preview =
    text.length > 5000
      ? text.slice(0, 5000) +
        '\n\n… (preview truncated — download for full content)'
      : text;

  outputEl.textContent = preview;

  const base =
    originalName.replace(
      /\.[^.]+$/,
      ''
    );

  const outName =
    `${base}-converted.${selectedFmt.ext}`;

  resultBlob = new Blob(
    [text],
    {
      type: selectedFmt.mime
    }
  );

  dlBtn.onclick = () => {
    const url =
      URL.createObjectURL(
        resultBlob
      );

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download = outName;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
  };

  setStatus('');
}

/* ─────────────────────────────────────────────────
   Reset result
───────────────────────────────────────────────────── */
function resetResult() {
  resultEl.classList.remove('show');

  hideProgress();

  outputEl.textContent = '';

  setStatus('');

  resultText = '';

  resultBlob = null;

  if (fileInput) {
    fileInput.value = '';
  }
}

/* ─────────────────────────────────────────────────
   Status message
───────────────────────────────────────────────────── */
function setStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

/* ─────────────────────────────────────────────────
   Copy result
───────────────────────────────────────────────────── */
copyBtn.addEventListener(
  'click',
  async () => {
    if (!resultText) {
      setStatus(
        'Nothing to copy yet.'
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        resultText
      );

      const original =
        copyBtn.textContent;

      copyBtn.textContent =
        'Copied!';

      setTimeout(() => {
        copyBtn.textContent =
          original;
      }, 1800);

    } catch {
      setStatus(
        'Copy failed — please select the text manually.'
      );
    }
  }
);

/* ─────────────────────────────────────────────────
   Convert another
───────────────────────────────────────────────────── */
resetBtn.addEventListener(
  'click',
  () => {
    resetResult();

    dropWrap.classList.remove(
      'hidden'
    );

    if (selectedFmt) {
      dropNote.textContent =
        `Accepts: ${selectedFmt.accept.replace(/,/g, ', ')} · or click to browse`;
    }

    window.scrollTo({
      top: dropWrap.offsetTop - 90,
      behavior: 'smooth'
    });
  }
);
