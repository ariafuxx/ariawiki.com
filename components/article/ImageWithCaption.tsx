"use client";

interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  fullWidth?: boolean;
}

export default function ImageWithCaption({
  src,
  alt,
  caption,
  fullWidth = false,
}: ImageWithCaptionProps) {
  return (
    <figure
      className="my-8"
      style={{
        maxWidth: fullWidth ? 900 : undefined,
        marginLeft: fullWidth ? "calc((720px - 900px) / 2)" : undefined,
        marginRight: fullWidth ? "calc((720px - 900px) / 2)" : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg transition-shadow duration-300 hover:shadow-lg"
        style={{ display: "block" }}
        loading="lazy"
      />
      {caption && (
        <figcaption
          className="mt-2 text-center"
          style={{
            fontSize: "13px",
            color: "#999",
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
