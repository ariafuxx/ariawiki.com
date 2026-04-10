import Quote from "./Quote";
import Callout from "./Callout";
import Expandable from "./Expandable";
import InteractiveChart from "./InteractiveChart";
import LightAndShade from "./LightAndShade";
import ImageWithCaption from "./ImageWithCaption";
import { HopeChart, DeliveredChart, ConcernsChart, TensionViz } from "./charts/Interview81kCharts";

export { Quote, Callout, Expandable, InteractiveChart, LightAndShade, ImageWithCaption };

/**
 * MDX component map for use with MDXRemote.
 * Keys are the component names available in .mdx files.
 */
export const mdxComponents = {
  Quote,
  Callout,
  Expandable,
  InteractiveChart,
  LightAndShade,
  ImageWithCaption,
  HopeChart,
  DeliveredChart,
  ConcernsChart,
  TensionViz,
};
