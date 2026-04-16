// utils/slugify.ts
export const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")        // replace spaces with hyphens
    .replace(/[^\w-]+/g, "");    // remove special chars
