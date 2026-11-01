// Pressione lunga (~500 ms) con un vero tocco (CDP) o con il mouse, su un punto dello schermo o su un'area registrata della scena.
export async function pressioneTocco(p, x, y, ms = 520) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

export async function pressioneMouse(p, x, y, ms = 520, bottone = 'left') {
  await p.mouse.move(x, y);
  await p.mouse.down({ button: bottone });
  await p.waitForTimeout(ms);
  await p.mouse.up({ button: bottone });
}

/** Tiene premuta (con il tocco) l'area `id` del registro della scena; aspetta che la scena sia ferma. */
export async function premiArea(p, id, ms = 520) {
  await p.waitForFunction(() => window.__ct.stabile(), null, { timeout: 8000 }).catch(() => undefined);
  const a = await p.evaluate((i) => window.__ct.aree()[i] ?? null, id);
  if (!a) throw new Error('area ' + id + ' non trovata');
  await pressioneTocco(p, a.x + a.w / 2, a.y + a.h / 2, ms);
  await p.waitForTimeout(260);
}
