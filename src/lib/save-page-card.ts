type SnapshotUser = {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

type SnapshotPhoto = {
  title?: string;
  photoUrl: string | null;
  spicy?: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** Cute Win94 “my page” scrapbook card with up to 6 photos. */
export async function saveMyPageSnapshot(opts?: {
  user?: SnapshotUser | null;
  photos?: SnapshotPhoto[];
}) {
  let user = opts?.user || null;
  let photos = opts?.photos || [];

  if (!user) {
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      user = me.user || null;
    } catch {
      user = null;
    }
  }

  if ((!photos || photos.length === 0) && user) {
    try {
      const data = await fetch("/api/items").then((r) => r.json());
      photos = (data.items || []).filter((i: SnapshotPhoto) => i.photoUrl);
    } catch {
      photos = [];
    }
  }

  const picks = photos.filter((p) => p.photoUrl).slice(0, 6);
  const W = 1080;
  const H = picks.length ? 1480 : 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas");

  // wallpaper
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f7a8d0");
  bg.addColorStop(0.45, "#ffc4e2");
  bg.addColorStop(1, "#d9b8ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // gingham hint
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < W; i += 28) {
    ctx.fillStyle = i % 56 === 0 ? "#fff" : "#e11d74";
    ctx.fillRect(i, 0, 14, H);
  }
  ctx.restore();

  // window chrome
  const pad = 48;
  const winX = pad;
  const winY = pad;
  const winW = W - pad * 2;
  const winH = H - pad * 2;

  ctx.fillStyle = "#f3eef7";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  ctx.fillRect(winX, winY, winW, winH);
  ctx.strokeRect(winX, winY, winW, winH);

  // titlebar
  const titleH = 64;
  const titleGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY);
  titleGrad.addColorStop(0, "#7b4dff");
  titleGrad.addColorStop(0.55, "#ff4f9a");
  titleGrad.addColorStop(1, "#ff8ec8");
  ctx.fillStyle = titleGrad;
  ctx.fillRect(winX + 2, winY + 2, winW - 4, titleH);

  ctx.fillStyle = "#fff";
  ctx.font = "700 28px Quicksand, Nunito, sans-serif";
  ctx.fillText("My Photos — C:\\USERS\\GIRL\\SNAPSHOT", winX + 24, winY + 42);

  // traffic lights
  const bx = winX + winW - 110;
  ["#fff", "#fff", "#ffb4c8"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(bx + i * 30, winY + 18, 22, 22);
    ctx.strokeStyle = "#716f64";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + i * 30, winY + 18, 22, 22);
  });

  // brand block
  const name = user?.displayName || "Luvcart girl";
  const handle = user?.username ? `@${user.username}` : "@luvcart";
  ctx.fillStyle = "#2b1438";
  ctx.font = "800 56px Quicksand, Nunito, sans-serif";
  ctx.fillText(name, winX + 40, winY + 150);
  ctx.fillStyle = "#e11d74";
  ctx.font = "400 34px VT323, monospace";
  ctx.fillText(handle, winX + 40, winY + 196);
  ctx.fillStyle = "#6b5a7a";
  ctx.font = "700 22px Quicksand, Nunito, sans-serif";
  ctx.fillText("private polaroid drive · windows 94", winX + 40, winY + 236);

  // avatar circle
  if (user?.avatarUrl) {
    const avatar = await loadImage(user.avatarUrl);
    if (avatar) {
      const ax = winX + winW - 160;
      const ay = winY + 120;
      const ar = 56;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      drawCover(ctx, avatar, ax - ar, ay - ar, ar * 2, ar * 2);
      ctx.restore();
      ctx.strokeStyle = "#ff4f9a";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // photo grid / empty state
  const gridTop = winY + 280;
  if (picks.length === 0) {
    ctx.fillStyle = "#fff5fb";
    roundRect(ctx, winX + 40, gridTop, winW - 80, 380, 8);
    ctx.fill();
    ctx.strokeStyle = "#716f64";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#e11d74";
    ctx.font = "700 36px Quicksand, Nunito, sans-serif";
    ctx.fillText("no pics yet — still cute though 💕", winX + 90, gridTop + 200);
  } else {
    const cols = picks.length === 1 ? 1 : picks.length === 2 ? 2 : 3;
    const gap = 18;
    const cellW = (winW - 80 - gap * (cols - 1)) / cols;
    const cellH = cellW * 1.15;

    for (let i = 0; i < picks.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = winX + 40 + col * (cellW + gap);
      const y = gridTop + row * (cellH + gap + 36);

      // polaroid
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillRect(x, y, cellW, cellH);
      ctx.shadowColor = "transparent";

      const img = await loadImage(picks[i].photoUrl!);
      const inset = 12;
      const picH = cellH - 52;
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + inset, y + inset, cellW - inset * 2, picH);
        ctx.clip();
        drawCover(ctx, img, x + inset, y + inset, cellW - inset * 2, picH);
        ctx.restore();
      } else {
        ctx.fillStyle = "#ffd6ea";
        ctx.fillRect(x + inset, y + inset, cellW - inset * 2, picH);
        ctx.fillStyle = "#e11d74";
        ctx.font = "700 28px Quicksand, Nunito, sans-serif";
        ctx.fillText("💕", x + cellW / 2 - 14, y + picH / 2 + 10);
      }

      ctx.strokeStyle = "#d8c9d8";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + inset, y + inset, cellW - inset * 2, picH);

      ctx.fillStyle = "#2b1438";
      ctx.font = "700 18px Quicksand, Nunito, sans-serif";
      const caption = `${picks[i].spicy ? "🌶️ " : ""}${picks[i].title || "untitled"}`;
      ctx.fillText(caption.slice(0, 22), x + inset, y + cellH - 16);
    }
  }

  // footer sticker
  ctx.fillStyle = "#2b1438";
  ctx.font = "700 20px Quicksand, Nunito, sans-serif";
  ctx.fillText("LUVCART · saved with 💾 Save", winX + 40, winY + winH - 36);
  ctx.fillStyle = "#e11d74";
  ctx.font = "400 28px VT323, monospace";
  ctx.fillText(new Date().toLocaleDateString("en-US"), winX + winW - 220, winY + winH - 34);

  const slug = (user?.username || "luvcart").replace(/[^a-z0-9_-]/gi, "");
  downloadCanvas(canvas, `${slug}-my-page.png`);
  return { ok: true as const, count: picks.length };
}
