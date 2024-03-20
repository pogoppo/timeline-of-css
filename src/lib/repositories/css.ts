import type { Database } from "sql.js";

export type Item = {
  name: string;
  category: string;
  parent: string;
  version: number;
  link: string;
  description: string;
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

  *orderByVersion() {
    const stmt = this.#db.prepare(`
      SELECT css.name, css.category, css.parent, css.version, css.link, css.description, ver.release_date
      FROM css
      INNER JOIN versions as ver
      ON css.browser = ver.browser AND css.version = ver.version
      WHERE css.version > 0
      ORDER BY css.version DESC, css.name
    `);

    while (stmt.step()) {
      const [name, category, parent, version, link, description, releaseDate] = stmt.get();
      yield { name, category, parent, version, link, description, releaseDate } as Item;
    };

    stmt.free();
  }

  parent(parentName: string) {
    const stmt = this.#db.prepare(`
      SELECT name, category, link, description
      FROM css
      WHERE version > 0 AND name = :parentName AND parent = :parentName
    `, { ':parentName': parentName });

    stmt.step();
    const { name, category, link, description } = stmt.getAsObject();
    stmt.free();

    return { name, category, link, description };
  }
}
