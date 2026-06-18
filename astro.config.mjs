import { defineConfig, passthroughImageService } from 'astro/config';
import mdx from '@astrojs/mdx';
// import sitemap from '@astrojs/sitemap';  // 临时禁用：sitemap 3.0.1 在 build 时报 "Cannot read properties of undefined (reading 'reduce')"，后续单独修
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://dqt-blog.vercel.app',
  integrations: [mdx(), tailwind()],
  // 跳过 sharp 图片优化（Windows 装 sharp 二进制经常挂）。Vercel 部署后用其自带图片优化。
  image: { service: passthroughImageService() }
});