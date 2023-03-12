import type CSS from "$lib/repositories/css";
import type { Item } from "$lib/repositories/css";

export type Fragment = {
  version: number;
  releaseDate: Date;
  items: Item[]
}

export type Milestone = {
  year: number;
  fragments: Fragment[];
}

export type Timeline = Milestone[];

export const createTimeline = (items: CSS) => {
  const result: Timeline = [];

  for (const item of items.orderByVersion()) {
    const releaseDate = new Date(item.releaseDate);
    const year = releaseDate.getUTCFullYear();
    const version = item.version;
    const value = {
      year,
      fragments: [
        {
          version,
          releaseDate,
          items: [item],
        },
      ],
    };

    if (!result.length) {
      result.push(value);
      continue;
    }

    const parent = result[result.length - 1];
    if (year !== parent.year) {
      result.push(value);
      continue;
    }

    const child = parent.fragments[parent.fragments.length - 1];
    if (version !== child.version) {
      parent.fragments.push(value.fragments[0]);
      continue;
    }

    child.items.push(item);
  }

  return result;
};
