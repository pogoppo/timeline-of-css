import { Prisma, PrismaClient } from '@prisma/client'
import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import type { BrowserName, CompatStatement } from '@mdn/browser-compat-data';

const prisma = new PrismaClient()
type PrismaInstance = Omit<PrismaClient<Prisma.PrismaClientOptions, never, any>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

// https://zenn.dev/cohky/articles/prisma-to-truncate より
async function truncate() {
  const allProperties = Object.keys(prisma);

  const modelNames = allProperties.filter(
    (x) => !(typeof x === "string" && (x.startsWith("$") || x.startsWith("_")))
  );

  for (const modelName of modelNames) {
    const query = `DELETE FROM ${modelName}`;
    await prisma.$queryRawUnsafe(query);
    console.log(`DELETE ${modelName}.`);
  };
}

type CSSItem = {
  name: string,
  category: string,
  parent: string,
  browser: BrowserName,
  version: number,
  link: string | undefined,
  description: string | undefined,
}
function createCSSItems(
  browser: BrowserName,
  category: string,
  name: string,
  item: any,
  parent: string,
) {
  const compat = (item as any)['__compat'] as CompatStatement;
  const support = compat.support[browser];
  if (support === undefined) {
    return [];
  }

  let version: number;
  if (Array.isArray(support)) {
    const versionString = String(support[support.length - 1]["version_added"]);
    version = Number(versionString?.match(/(\d+)/)?.[0]);
  } else {
    const versionString = String(support["version_added"]);
    version = Number(versionString?.match(/(\d+)/)?.[0]);
  }
  version = !!version ? version : 0;

  const items: CSSItem[] = [];
  items.push({
    name,
    category,
    parent,
    browser,
    version,
    link: compat["mdn_url"],
    description: compat["description"],
  });
  console.log(`Create ${category}.${name} for ${browser} version ${version}`);

  if (parent === name) {
    const children = Object.keys(item).filter(k => k !== '__compat');
    for (const childName of children) {
      const parentName = name;
      items.push(...createCSSItems(browser, category, childName, item[childName], parentName));
    }
  }

  return items;
}

async function createCSS(browser: BrowserName, prismaInstance: PrismaInstance) {
  const tablename = "css";
  console.log(`Create ${tablename} table.`);

  const createdItems: CSSItem[] = [];
  for (const category in bcd.css) {
    const items = Object.entries(bcd.css[category]);
    for (const [name, item] of items) {
      const parent = name;
      createdItems.push(...createCSSItems(browser, category, name, item, parent));
    }
  }

  // skipDuplicatesがないので自前で実装
  const uniqueItems = createdItems.filter((item, index, self) => {
    return self.findIndex((t) => (
      t.name === item.name &&
      t.category === item.category &&
      t.parent === item.parent &&
      t.browser === item.browser
    )) === index;
  });

  await prismaInstance[tablename].createMany({
    data: uniqueItems
  })
}

type Version = {
  browser: BrowserName,
  version: number,
  release_date: Date,
};
async function createVersions(browser: BrowserName, prismaInstance: PrismaInstance) {
  const tablename = "versions";
  console.log(`Create ${tablename} table.`);

  const releases = bcd.browsers[browser]["releases"];
  const versions: Version[] = [];
  for (const [version, item] of Object.entries(releases)) {
    const yyyymmdd = item["release_date"] ?? ""; // ソース元がYYYY-MM-DDのみで適当
    versions.push({
      browser,
      version: Number(version),
      release_date: new Date(yyyymmdd) // YYYY-MM-DDだけを引数とする場合はUTCで返すらしい
    });
  }

  await prismaInstance[tablename].createMany({
    data: versions
  })
}

async function main() {
  const browser = "firefox";

  // SQLiteとPrismaの仕様上、トランザクション内でtruncateができない
  console.log(`Beging truncate.`);
  await truncate();

  return await prisma.$transaction(async (prismaInstance) => {
    console.log(`Beging createCSS.`);
    await createCSS(browser, prismaInstance);
    console.log(`Beging createVersions.`);
    return createVersions(browser, prismaInstance);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    console.log(`Finish scraping.`);
  });
