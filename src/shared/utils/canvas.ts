import rasterizeHTML from "rasterizehtml";
import { Image as ImageJS } from "image-js";

export const imageOnCanvas = async (
  _image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  base64: string
) => {
  let image = await ImageJS.load(base64);

  if (image.width > 1920) {
    image = image.resize({ width: 1920 });
  }

  const imageCanvas = image.getCanvas();

  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Redimensionar canvas para o tamanho da imagem
      canvas.width = imageCanvas.width;
      canvas.height = imageCanvas.height;
      // Desenhar a imagem no canvas
      ctx.drawImage(imageCanvas, 0, 0);
    }
  }

  return true;
};

export const textOnCanvas = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  base64: string,
  html: string
) => {
  return new Promise((resolve) => {
    const fullHtml = `
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: ${canvas.height}px;
        "
      >
        <div style="width: 80%; height: 45%; font-family: Arial, Helvetica, sans-serif;">
          ${html}
        </div>
      </div>
    `;

    imageOnCanvas(image, canvas, base64).then(() => {
      rasterizeHTML.drawHTML(fullHtml, canvas, {}).then(() => {
        resolve(true);
      });
    });
  });
};
