// אנימציית גלילה: השעון מתקרב, הטקסט נעלם, המסך נדלק ומופיעים הכפתורים

const hero = document.querySelector('.hero');
const sticky = document.querySelector('.hero-sticky');
const stage = document.querySelector('.watch-stage');
const zoom = document.querySelector('.watch-zoom');
const screenGlow = document.querySelector('.watch-screen');
const watchHd = document.querySelector('.watch-hd');
const text = document.querySelector('.hero-text');
const shade = document.querySelector('.hero-shade');
const ui = document.querySelector('.screen-ui');

// מיקום מסך השעון בתוך התמונה - נקרא ישירות מה-CSS של .watch-screen,
// כך שמספיק לשנות את המספרים ב-style.css
function getScreen() {
  return {
    x: screenGlow.offsetLeft / zoom.offsetWidth,
    y: screenGlow.offsetTop / zoom.offsetHeight,
    w: screenGlow.offsetWidth / zoom.offsetWidth,
    h: screenGlow.offsetHeight / zoom.offsetHeight
  };
}

// מחזיר כמה התקדמנו בתוך טווח מסוים של הגלילה: 0 עד 1
function range(p, start, end) {
  return Math.min(Math.max((p - start) / (end - start), 0), 1);
}

// תנועה רכה (מאט בסוף)
function ease(t) {
  return 1 - Math.pow(1 - t, 3);
}

function update() {
  // p = התקדמות הגלילה בתוך ה-hero, מ-0 עד 1
  const heroRect = hero.getBoundingClientRect();
  const scrollable = hero.offsetHeight - window.innerHeight;
  const p = range(-heroRect.top, 0, scrollable);

  const vw = sticky.clientWidth;
  const vh = sticky.clientHeight;
  const stickyRect = sticky.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const stageLeft = stageRect.left - stickyRect.left;
  const stageTop = stageRect.top - stickyRect.top;

  // גודל ומרכז מסך השעון לפני ההגדלה
  const SCREEN = getScreen();
  const screenW = stageRect.width * SCREEN.w;
  const screenH = stageRect.height * SCREEN.h;
  const localX = stageRect.width * (SCREEN.x + SCREEN.w / 2);
  const localY = stageRect.height * (SCREEN.y + SCREEN.h / 2);
  const centerX = stageLeft + localX;
  const centerY = stageTop + localY;

  // ההגדלה הסופית: המסך ממלא בערך 62% מגובה החלון (או 80% מהרוחב בטלפון).
  // לא מגדילים יותר מזה כדי שהתמונה (1920px) לא תיראה מטושטשת
  const maxScale = Math.min((vh * 0.62) / screenH, (vw * 0.8) / screenW);

  // שלב 1: התקרבות לשעון והזזתו למרכז (0% עד 55% מהגלילה)
  const z = ease(range(p, 0, 0.55));
  const scale = 1 + (maxScale - 1) * z;
  const tx = localX + (vw / 2 - centerX) * z - scale * localX;
  const ty = localY + (vh / 2 - centerY) * z - scale * localY;
  zoom.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

  // התקריב החד מופיע בהדרגה בזמן הזום (בין 12% ל-35% מהגלילה),
  // כך שכשמגיעים קרוב - רואים תמונה חדה במקום הגדלה מטושטשת
  watchHd.style.opacity = range(p, 0.12, 0.35);

  // הטקסט מתכווץ ונעלם (0% עד 35%)
  const t = range(p, 0, 0.35);
  text.style.transform = `scale(${1 - 0.7 * t})`;
  text.style.opacity = 1 - t;
  shade.style.opacity = 1 - t;

  // שלב 2: המסך נדלק, כמו קו שנפתח למסך מלא (55% עד 72%)
  const on = range(p, 0.55, 0.72);
  screenGlow.style.opacity = Math.min(on * 3, 1);
  screenGlow.style.transform = `scaleY(${0.04 + 0.96 * ease(on)})`;

  // שלב 3: הכפתורים מופיעים על המסך (68% עד 85%)
  const u = range(p, 0.68, 0.85);
  const uiW = screenW * maxScale;
  const uiH = screenH * maxScale;
  ui.style.width = uiW + 'px';
  ui.style.height = uiH + 'px';
  ui.style.left = (vw - uiW) / 2 + 'px';
  ui.style.top = (vh - uiH) / 2 + 'px';
  ui.style.fontSize = Math.max(uiW / 22, 13) + 'px';
  ui.style.opacity = u;
  ui.style.transform = `translateY(${(1 - u) * 20}px)`;
  ui.style.visibility = u > 0 ? 'visible' : 'hidden';
}

// השעה והתאריך על מסך השעון - האמיתיים, מתעדכנים כל 10 שניות
const watchTime = document.querySelector('.watch-time');
const watchDate = document.querySelector('.watch-date');
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  watchTime.textContent = hh + ':' + mm;
  watchDate.textContent = DAYS[now.getDay()] + ' ' + now.getDate(); // לדוגמה: TUE 24
}

updateClock();
setInterval(updateClock, 10000);

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
update();
