export const processHTML = (htmlString: string, multiplier: number) => {
  const container = document.createElement("div");
  container.innerHTML = htmlString;

  const fontSizeConverter: { [key: string]: number } = {};

  [8, 10, 12, 14, 16, 18, 24, 36, 48].forEach((size) => {
    fontSizeConverter[`font-size: ${size}px`] = size * multiplier;
  });

  const processChildren = (children: any) => {
    Array.from(children).forEach((child: any) => {
      let fontSize;

      if (child.nodeName !== "STRONG" && child.nodeName !== "EM") {
        const style = child.getAttribute("style");

        if (style) {
          fontSize = style
            .split(";")
            .map((t: string) => t.trim())
            .filter((t: string) => t)
            .find((t: string) => Object.keys(fontSizeConverter).includes(t));
        }

        if (fontSize) {
          child.style.fontSize = `${fontSizeConverter[fontSize]}px`;
        } else {
          child.style.fontSize = `${fontSizeConverter["font-size: 14px"]}px`;
        }
      }

      if (child.children.length) {
        processChildren(child.children);
      }
    });
  };

  processChildren(container.children);

  return container.innerHTML;
};
