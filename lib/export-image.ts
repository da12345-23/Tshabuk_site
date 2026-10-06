// Turning the invite into a PNG with html-to-image, made dependable on
// iPhones. Safari (and every iOS browser, which all run on Safari's engine)
// was saving the photo with the text but without the logo, mascots or
// puzzle pieces: html-to-image draws the card through an SVG snapshot, and
// Safari paints that snapshot before the pictures inside it are ready.

const dataUrls = new Map<string, Promise<string>>();

function toDataUrl(src: string) {
  let pending = dataUrls.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${src}`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      );
    pending.catch(() => dataUrls.delete(src));
    dataUrls.set(src, pending);
  }
  return pending;
}

/** Embed every picture in `root` as data, fully decoded, so the snapshot
 *  never has to fetch or wait for one. */
async function embedImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.src;
      if (src && !src.startsWith("data:")) {
        try {
          img.src = await toDataUrl(src);
        } catch {
          // keep the original src; html-to-image will try it itself
        }
      }
      try {
        await img.decode();
      } catch {
        // a broken image shouldn't block the rest of the photo
      }
    })
  );
}

/** Safari's engine: desktop Safari and every browser on iPhone/iPad. */
function isWebKit() {
  const ua = navigator.userAgent;
  return /AppleWebKit/.test(ua) && !/(Chrome|Chromium|Edg|OPR|SamsungBrowser|Android)\//.test(ua);
}

export async function renderInvitePng(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  await embedImages(node);
  const options = { pixelRatio: 2 };
  if (isWebKit()) {
    // Safari only paints pictures into the snapshot once it has drawn them
    // before -- the well-known workaround is a couple of throwaway passes.
    await toPng(node, { pixelRatio: 1 });
    await toPng(node, { pixelRatio: 1 });
  }
  return toPng(node, options);
}
