export async function generateSlug(
  name: string,
  existsCheck: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = base;
  let counter = 1;

  while (await existsCheck(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}
