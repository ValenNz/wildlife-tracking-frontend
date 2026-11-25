import type { DetailedHTMLProps, HTMLAttributes } from "react";

/** Elemen web <model-viewer> (@google/model-viewer) untuk JSX. Atribut kebab-case diteruskan apa adanya. */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        [attribute: `${string}-${string}`]: string | number | boolean | undefined;
        ar?: boolean | string;
        exposure?: string;
        poster?: string;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "manual";
      };
    }
  }
}
