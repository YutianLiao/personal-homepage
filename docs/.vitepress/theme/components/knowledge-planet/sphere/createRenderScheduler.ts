import type { SceneContext } from "./createScene";

const DAMP_TAIL_FRAMES = 90;

/** 按需渲染：静止时停帧，拖拽/阻尼/高亮变化时再绘制 */
export function createRenderScheduler(ctx: SceneContext) {
  let rafId = 0;
  let tailFrames = 1;
  let running = false;

  function renderOnce() {
    ctx.controls.update();
    ctx.renderer.render(ctx.scene, ctx.camera);
  }

  function bumpTail(extra = DAMP_TAIL_FRAMES) {
    tailFrames = Math.max(tailFrames, extra);
    ensureLoop();
  }

  function ensureLoop() {
    if (running) return;
    running = true;
    const loop = () => {
      rafId = 0;
      if (document.hidden) {
        running = false;
        return;
      }
      if (tailFrames <= 0) {
        running = false;
        return;
      }
      tailFrames -= 1;
      renderOnce();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  }

  ctx.controls.addEventListener("start", () => bumpTail());
  ctx.controls.addEventListener("change", () => bumpTail());
  ctx.controls.addEventListener("end", () => bumpTail());

  const onVisibility = () => {
    if (!document.hidden) bumpTail(1);
  };
  document.addEventListener("visibilitychange", onVisibility);

  bumpTail(1);

  return {
    requestRender() {
      bumpTail(1);
    },
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
      running = false;
      tailFrames = 0;
    }
  };
}
