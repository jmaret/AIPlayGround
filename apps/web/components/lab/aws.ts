export type AwsGlyph = "edge" | "shield" | "workflow" | "compute" | "model" | "bucket" | "search" | "cache" | "metrics";

export type AwsBox = {
  name: string;
  role: string;
  glyph: AwsGlyph;
  about: string;
};

export type AwsModel = {
  name: string;
  about: string;
};

export type AwsTwinMap = {
  title: string;
  about: string;
  models?: AwsModel[];
  scale: string;
  scaleAbout: string;
  boxes: AwsBox[];
};
