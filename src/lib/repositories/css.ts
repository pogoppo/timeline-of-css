import type { Database } from "sql.js";

export type Item = {
  name: string;
  category: string;
  version: number;
  link: string;
  releaseDate: string;
}

export default class {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  lastUpdate() {
    const stmt = this.#db.prepare(`
      SELECT ver.release_date
      FROM css
      INNER JOIN versions as ver
      ON css.browser = ver.browser AND css.version = ver.version
      ORDER BY css.version DESC
      LIMIT 1
    `);

    stmt.step();
    const { release_date } = stmt.getAsObject();
    stmt.free();
    return new Date(release_date as number);
  }

  *orderByVersion(asc: boolean = false) {
    const stmt = this.#db.prepare(`
      SELECT css.name, css.category, css.version, css.link, ver.release_date
      FROM css
      INNER JOIN versions as ver
      ON css.browser = ver.browser AND css.version = ver.version
      WHERE css.version > 0 AND css.category != 'types'
      ORDER BY css.version DESC, css.name
    `);

    while (stmt.step()) {
      const [name, category, version, link, releaseDate] = stmt.get();
      yield { name, category, version, link, releaseDate } as Item;
    };

    stmt.free();
  }
}
