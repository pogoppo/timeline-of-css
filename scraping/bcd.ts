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
  for (const category in bcd.css) {
    for (const [name, item] of Object.entries(bcd.css[category])) {
      const compat = (item as any)['__compat'] as CompatStatement;
      const support = compat.support[browser];
      if (support === undefined) {
        continue
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
          browser,
          version,
          link: compat["mdn_url"]
        },
      });
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
  });
