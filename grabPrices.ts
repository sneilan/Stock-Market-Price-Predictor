import _ from 'lodash';
import { loadDb, storage } from "./util/database";

export const grabAllPricesBySymbolSortedDesc = async (symbol: string) => {
  const sequelize = await loadDb(storage);

  type Bar = { open: number, high: number, low: number, close: number, date: string };
  const [results] = await sequelize.query(`select open, high, low, close, date from daily_bars where symbol = '${symbol}' order by date asc`) as [Bar[], unknown];

  return _.orderBy(results, ['date'], ['asc']);
}

export const grabAllSymbols = async () => {
  const sequelize = await loadDb(storage);
  const [results] = await sequelize.query(`select symbol from daily_bars group by symbol`) as [{ symbol: string }[], unknown];
  return _.map(results, 'symbol');
}
