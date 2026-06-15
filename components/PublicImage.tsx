import { assetPath } from "@/lib/basePath";

type PublicImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Imagen estática de `/public` con prefijo correcto en GitHub Pages. */
export default function PublicImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
}: PublicImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath(src)}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
