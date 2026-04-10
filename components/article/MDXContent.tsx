"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
}

export default function MDXContent({ source, components }: MDXContentProps) {
  return <MDXRemote {...source} components={components} />;
}
