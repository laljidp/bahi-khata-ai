import nextConfig from "eslint-config-next";

const eslintConfig = [
  { ignores: ["app/generated/prisma/**"] },
  ...nextConfig,
];

export default eslintConfig;
