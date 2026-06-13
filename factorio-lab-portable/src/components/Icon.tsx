import React, { CSSProperties } from "react";

interface IconProps {
  position?: string;
  spritePath?: string;
  quality?: string;
  scale?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  spritePath,
  position,
  quality = "0",
  scale = 1,
  className = "",
}) => {
  const width = 64;
  const height = 64;

  if (!position) {
    position = "-192px 0px";
    quality = "0";
    spritePath = "./factoriolab/browser/icons.webp";
  }

  // Sprite sheet + position for each quality level
  const qualitySpriteMap = new Map<string, { path: string; position: string }>([
    [
      "0",
      { path: "./factoriolab/browser/icon/icons.webp", position: "-66px 0px" },
    ],
    [
      "-1",
      {
        path: "./factoriolab/browser/data/spa/icons.webp",
        position: "0px 0px",
      },
    ],
    [
      "1",
      {
        path: "./factoriolab/browser/data/spa/icons.webp",
        position: "-66px 0px",
      },
    ],
    [
      "2",
      {
        path: "./factoriolab/browser/data/spa/icons.webp",
        position: "0px -66px",
      },
    ],
    [
      "3",
      {
        path: "./factoriolab/browser/data/spa/icons.webp",
        position: "-66px -66px",
      },
    ],
    [
      "5",
      {
        path: "./factoriolab/browser/data/spa/icons.webp",
        position: "-132px 0px",
      },
    ],
  ]);

  const qualitySprite =
    qualitySpriteMap.get(quality) ?? qualitySpriteMap.get("0")!;

  const mainSpriteStyle: CSSProperties = {
    backgroundImage: `url(${spritePath})`,
    backgroundPosition: position,
    backgroundRepeat: "no-repeat",
    width: `${width}px`,
    height: `${height}px`,
    backgroundSize: "auto",
    // imageRendering: "pixelated",
    overflow: "hidden",
    transformOrigin: "top left",
    transform: `scale(${scale})`,
    position: "absolute",
    top: 0,
    left: 0,
  };

  const qualityOverlayStyle: CSSProperties = {
    backgroundImage: `url(${qualitySprite.path})`,
    backgroundPosition: qualitySprite.position,
    backgroundRepeat: "no-repeat",
    backgroundSize: "auto",
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute",
    top: 0,
    left: 0,
    transformOrigin: "top left",
    transform: `translate(${-16 * scale}px, ${16 * scale}px) scale(${scale})`,
    zIndex: 1,
  };

  const wrapperStyle: CSSProperties = {
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    display: "inline-block",
    position: "relative",
  };

  return (
    <div style={wrapperStyle} className={className}>
      <div style={mainSpriteStyle} />
      <div style={qualityOverlayStyle} />
    </div>
  );
};

export default Icon;
