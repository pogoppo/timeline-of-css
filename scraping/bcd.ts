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
        version = Number(support[0]["version_added"]);
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
    await createCSS(browser, prismaInstance);
    return createVersions(browser, prismaInstance);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  });