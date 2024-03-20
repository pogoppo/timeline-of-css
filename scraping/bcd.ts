import { Prisma, PrismaClient } from '@prisma/client'
import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import type { BrowserName, CompatStatement } from '@mdn/browser-compat-data';

const prisma = new PrismaClient()

async function create(prismaInstance: any, tablename: string, param: { data: any }) {
  try {
    await prismaInstance[tablename].create(param);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        // 重複エラーは無視
        return;
      }
    }
    console.error(e);
  }
}

// https://zenn.dev/cohky/articles/prisma-to-truncate より
async function truncate() {
  const allProperties = Object.keys(prisma);

  const modelNames = allProperties.filter(
    (x) => !(typeof x === "string" && (x.startsWith("$") || x.startsWith("_")))
  );

  for (const modelName of modelNames) {
    const query = `DELETE FROM ${modelName}`;
    await prisma.$queryRawUnsafe(query);
  };
}

async function createCSS(browser: BrowserName, prismaInstance: any) {
  const createItem = async (
    category: string,
    name: string,
    item: any,
    parent: string,
  ) => {
    const compat = (item as any)['__compat'] as CompatStatement;
    const support = compat.support[browser];
    if (support === undefined) {
      return;
    }

    let version: number;
    if (Array.isArray(support)) {
      version = Number(support[support.length - 1]["version_added"]);
    } else {
      version = Number(support["version_added"]);
    }
    version = !!version ? version : 0;

    await create(prismaInstance, "css", {
      data: {
        name,
        category,
        parent,
        browser,
        version,
        link: compat["mdn_url"],
        description: compat["description"],
      }
    });
    console.log(`Create ${category}.${name} for ${browser} version ${version}`);

    if (parent === name) {
      const children = Object.keys(item).filter(k => k !== '__compat');
      for (const childName of children) {
        const parentName = name;
        await createItem(category, childName, item[childName], parentName);
      }
    }
  }

  for (const category in bcd.css) {
    const items = Object.entries(bcd.css[category]);
    for (const [name, item] of items) {
      await createItem(category, name, item, name);
    }
  }
}

async function createVersions(browser: BrowserName, prismaInstance: any) {
  const releases = bcd.browsers[browser]["releases"];
  for (const [version, item] of Object.entries(releases)) {
    const yyyymmdd = item["release_date"] ?? ""; // ソース元がYYYY-MM-DDのみで適当
    await create(prismaInstance, "versions", {
      data: {
        browser,
        version: Number(version),
        release_date: new Date(yyyymmdd) // YYYY-MM-DDだけを引数とする場合はUTCで返すらしい
      },
    });
  }
}

async function main() {
  const browser = "firefox";
  return await prisma.$transaction(async (prismaInstance) => {
    await truncate();
    await createCSS(browser, prismaInstance);
    return createVersions(browser, prismaInstance);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    console.log(`Finish scraping.`);
  });
