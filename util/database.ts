import fs from 'fs';
import { Sequelize, STRING, INTEGER, NUMBER, DATEONLY } from 'sequelize';

export const storage = '../data/daily.db';

export const getBarModel = async (sequelize: Sequelize) => {
  const Bar = sequelize.define('daily_bars', {
    symbol: STRING,
    open: NUMBER,
    high: NUMBER,
    low: NUMBER,
    close: NUMBER,
    volume_weighted: INTEGER,
    n: INTEGER,
    // unix_time: INTEGER,
    date: DATEONLY
  });

  await sequelize.sync();

  return Bar;
}

export const loadDb = async (storage: string) => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    // https://sequelize.org/docs/v6/getting-started/#logging
    logging: false
  });

  await sequelize.authenticate();

  return sequelize;
}
