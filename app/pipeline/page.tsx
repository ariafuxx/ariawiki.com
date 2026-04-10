import { Metadata } from "next";
import PipelineClient from "./PipelineClient";

export const metadata: Metadata = {
  title: "Pipeline | Aria Wiki",
  description: "Content pipeline draft review interface",
};

export default function PipelinePage() {
  return <PipelineClient />;
}
