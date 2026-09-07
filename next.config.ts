import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The Genius Mining module is a workspace package published as TypeScript
  // source, so Next has to compile it rather than expect prebuilt JavaScript.
  transpilePackages: ['@hiddengeniuslabs/genius-mining'],
};

export default nextConfig;
