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
  const qualitySpritePath = "./factoriolab/browser/icons.webp";

  if (!position) {
    position = "-192px 0px";
    quality = "0";
    spritePath = "./factoriolab/browser/icons.webp";
  }
  let spriteLocationMap = new Map<string, string>([
    ["default", "-192px 0px"],
    ["0", "-256px -256px"],
    ["5", "-256px -192px"],
    ["3", "-192px -192px"],
    ["2", "-128px -192px"],
    ["1", "-64px -192px"],
    ["-1", "-0px -192px"],
  ]);

  const qualitySpriteLocation = spriteLocationMap.get(quality);

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
    ...mainSpriteStyle,
    backgroundImage: `url(${qualitySpritePath})`,
    backgroundPosition: qualitySpriteLocation ?? spriteLocationMap.get("0"),
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
      {qualitySpritePath && <div style={qualityOverlayStyle} />}
    </div>
  );
};

export default Icon;
