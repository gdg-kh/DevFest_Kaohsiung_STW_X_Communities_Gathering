import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, registerFont } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAND = {
  paper: '#f0f0f0',
  ink: '#1e1e1e',
  red: '#ea4335',
  line: '#d0d0d0',
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const BORDER_WIDTH = 24;

const FONT_FAMILY = 'GDG Sans';
const FONT_DIR = path.resolve(__dirname, '..', 'assets', 'fonts');

let fontsRegistered = false;

function pickLang(field, fallback) {
  if (!field || typeof field !== 'object') {
    return fallback || '';
  }
  return field['zh-Hant'] || field.en || field.ja || fallback || '';
}

function registerFontsOnce() {
  if (fontsRegistered) {
    return;
  }
  fontsRegistered = true;
  if (!existsSync(FONT_DIR)) {
    console.warn(`[render-og] 找不到字型資料夾：${FONT_DIR}，將使用系統預設字型`);
    return;
  }
  const candidates = [
    { file: 'NotoSansTC-Regular.ttf', weight: '400' },
    { file: 'NotoSansTC-Medium.ttf', weight: '500' },
    { file: 'NotoSansTC-Bold.ttf', weight: '700' },
    { file: 'NotoSansTC-Black.ttf', weight: '900' },
  ];
  let registered = 0;
  candidates.forEach((entry) => {
    const abs = path.join(FONT_DIR, entry.file);
    if (!existsSync(abs)) {
      return;
    }
    try {
      registerFont(abs, { family: FONT_FAMILY, weight: entry.weight });
      registered += 1;
    } catch (err) {
      console.warn(`[render-og] 註冊字型失敗 ${entry.file}：${err.message}`);
    }
  });
  if (registered === 0) {
    console.warn(`[render-og] 字型資料夾存在但沒有可用字型檔：${FONT_DIR}`);
  }
}

function drawBase(ctx, config) {
  ctx.fillStyle = BRAND.paper;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = BRAND.red;
  ctx.fillRect(0, 0, CANVAS_WIDTH, BORDER_WIDTH);
  ctx.fillRect(0, CANVAS_HEIGHT - BORDER_WIDTH, CANVAS_WIDTH, BORDER_WIDTH);
  ctx.fillRect(0, 0, BORDER_WIDTH, CANVAS_HEIGHT);
  ctx.fillRect(CANVAS_WIDTH - BORDER_WIDTH, 0, BORDER_WIDTH, CANVAS_HEIGHT);

  const eventName = pickLang((config && config.site && config.site.eventName) || {}, 'GDG Kaohsiung');
  const eventDate = (config && config.site && config.site.eventDate) || '';
  ctx.fillStyle = BRAND.ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 32px "${FONT_FAMILY}", sans-serif`;
  ctx.fillText(eventName, 48, CANVAS_HEIGHT - 56);
  if (eventDate) {
    ctx.font = `400 26px "${FONT_FAMILY}", sans-serif`;
    ctx.fillStyle = '#555555';
    ctx.fillText(eventDate, 48, CANVAS_HEIGHT - 22);
  }
}

export function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  if (!text) {
    return 0;
  }
  const chars = Array.from(String(text));
  const lines = [];
  let current = '';
  for (const ch of chars) {
    const attempt = current + ch;
    if (ctx.measureText(attempt).width > maxWidth) {
      if (current === '') {
        lines.push(attempt);
        current = '';
      } else {
        lines.push(current);
        current = ch;
      }
      if (lines.length >= maxLines) {
        break;
      }
    } else {
      current = attempt;
    }
  }
  if (lines.length < maxLines && current) {
    lines.push(current);
  }
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    const remainingIndex = chars.slice(lines.join('').length).length;
    if (remainingIndex > 0) {
      while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = `${last}…`;
    }
  }
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  return lines.length;
}

function initialCharacter(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return '?';
  }
  return Array.from(trimmed)[0];
}

async function tryLoadImage(imagePath) {
  if (!imagePath) {
    return null;
  }
  try {
    if (!existsSync(imagePath)) {
      return null;
    }
    return await loadImage(imagePath);
  } catch (err) {
    console.warn(`[render-og] 載入圖片失敗 ${imagePath}：${err.message}`);
    return null;
  }
}

function drawCircleAvatar(ctx, image, cx, cy, radius, fallbackText) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (image) {
    const size = radius * 2;
    const ratio = Math.max(size / image.width, size / image.height);
    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;
    ctx.drawImage(image, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = BRAND.line;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.fillStyle = BRAND.ink;
    ctx.font = `900 220px "${FONT_FAMILY}", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(fallbackText, cx, cy + 20);
    ctx.textAlign = 'start';
  }
  ctx.restore();
}

function drawNumberBadge(ctx, cx, cy, radius, order) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = BRAND.red;
  ctx.fill();
  ctx.fillStyle = BRAND.paper;
  ctx.font = `900 56px "${FONT_FAMILY}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(order || ''), cx, cy + 4);
  ctx.textAlign = 'start';
  ctx.restore();
}

async function renderPerson(ctx, { type, item, layout }) {
  const avatarRadius = 190;
  const avatarCx = 100 + avatarRadius;
  const avatarCy = CANVAS_HEIGHT / 2;
  const nameText = pickLang(item.name);
  const initial = initialCharacter(nameText);

  const image = await tryLoadImage(layout && layout.imagePath);
  drawCircleAvatar(ctx, image, avatarCx, avatarCy, avatarRadius, initial);

  if (type === 'speakers' && item.order) {
    drawNumberBadge(ctx, avatarCx - avatarRadius + 40, avatarCy - avatarRadius + 40, 48, item.order);
  }

  const textX = 100 + avatarRadius * 2 + 60;
  const textMaxWidth = CANVAS_WIDTH - textX - 60;
  ctx.fillStyle = BRAND.ink;
  ctx.font = `900 72px "${FONT_FAMILY}", sans-serif`;
  drawWrappedText(ctx, nameText, textX, 130, textMaxWidth, 88, 2);

  ctx.font = `500 40px "${FONT_FAMILY}", sans-serif`;
  ctx.fillStyle = '#333333';
  const sub = type === 'speakers' ? pickLang((layout && layout.sessionTitle) || null) : pickLang(item.role);
  drawWrappedText(ctx, sub || '', textX, 320, textMaxWidth, 56, 2);
}

async function renderLogo(ctx, { item, layout }) {
  const nameText = pickLang(item.name);
  const initial = initialCharacter(nameText);

  const image = await tryLoadImage(layout && layout.imagePath);
  const areaWidth = 600;
  const areaHeight = 360;
  const areaX = (CANVAS_WIDTH - areaWidth) / 2;
  const areaY = 90;

  if (image) {
    const ratio = Math.min(areaWidth / image.width, areaHeight / image.height);
    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;
    const dx = areaX + (areaWidth - drawWidth) / 2;
    const dy = areaY + (areaHeight - drawHeight) / 2;
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = BRAND.line;
    ctx.fillRect(areaX, areaY, areaWidth, areaHeight);
    ctx.fillStyle = BRAND.ink;
    ctx.font = `900 200px "${FONT_FAMILY}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, areaX + areaWidth / 2, areaY + areaHeight / 2);
    ctx.textAlign = 'start';
  }

  ctx.fillStyle = BRAND.ink;
  ctx.font = `700 56px "${FONT_FAMILY}", sans-serif`;
  ctx.textAlign = 'center';
  drawWrappedText(ctx, nameText, CANVAS_WIDTH / 2, areaY + areaHeight + 40, CANVAS_WIDTH - 200, 72, 2);
  ctx.textAlign = 'start';
}

export async function renderOgImage({ type, item, layout, config, outPath }) {
  registerFontsOnce();
  if (!item || typeof item !== 'object') {
    throw new Error('renderOgImage: item 為空');
  }
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');
  drawBase(ctx, config || {});

  const layoutKind = (layout && layout.kind) || 'person';
  if (layoutKind === 'person') {
    await renderPerson(ctx, { type, item, layout });
  } else if (layoutKind === 'logo') {
    await renderLogo(ctx, { type, item, layout });
  } else {
    throw new Error(`renderOgImage: 未知 layout.kind：${layoutKind}`);
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outPath, buffer);
  return outPath;
}
