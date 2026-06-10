declare module 'dom-to-image-more' {
  interface DomToImageOptions {
    bgcolor?: string;
    scale?: number;
    width?: number;
    height?: number;
    style?: Record<string, string>;
    cacheBust?: boolean;
    imagePlaceholder?: string;
    httpTimeout?: number;
    filter?: (node: Node) => boolean;
    onclone?: (document: Document) => void;
  }

  export function toPng(node: Node, options?: DomToImageOptions): Promise<string>;
  export function toJpeg(node: Node, options?: DomToImageOptions): Promise<string>;
  export function toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>;
  export function toCanvas(node: Node, options?: DomToImageOptions): Promise<HTMLCanvasElement>;
  export function toPixelData(node: Node, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
  export function toSvg(node: Node, options?: DomToImageOptions): Promise<string>;
}
