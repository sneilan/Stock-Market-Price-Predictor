import * as tf from '@tensorflow/tfjs';
import _ from 'lodash';
import { grabAllPricesBySymbolSortedDesc } from './grabPrices';

export const overlappingChunks = <Type>(array: Type[], chunkSize: number) => {
  // Returns overlapping array chunks like https://stackoverflow.com/a/14986106/761726
  // https://stackoverflow.com/q/14985948/761726
  var retArr = [];

  for (var i = 0; i < array.length - (chunkSize - 1); i++) {
    retArr.push(array.slice(i, i + chunkSize));
  }

  return retArr;
}

export const generateSequencesAndLabels = (prices: number[], sequenceLength: number) => {
  const sequences: number[][] = [];
  let labels: number[] = [];

  const chunks = overlappingChunks(prices, sequenceLength + 1);
  if (chunks.length === 0) {
    throw Error(`Sequence length of ${sequenceLength} too long for list of prices of length ${prices.length}`);
  }

  for (const chunk of chunks) {
    sequences.push(chunk.slice(0, sequenceLength));
    labels.push(chunk[sequenceLength - 1]);
  }

  return { sequences, labels };
}

export const generateDatasetFromSequencesAndLabels = (sequences: number[][], labels: number[]) => {
  const numExamples = sequences.length;
  const sequenceLength = sequences[0].length;

  const sequencesBuffer = tf.buffer([numExamples, sequenceLength, 1]);

  const labelsBuffer = tf.buffer([numExamples, 1]);
  for (let i = 0; i < numExamples; ++i) {
    for (let j = 0; j < sequenceLength; ++j) {
      // sequencesBuffer.set(0, i, j, sequences[i][j]);
      sequencesBuffer.set(sequences[i][j], i, j, 0);
    }

    labelsBuffer.set(labels[i], i, 0);
  }

  return { sequences: sequencesBuffer.toTensor(), labels: labelsBuffer.toTensor() };
}

export const normalizePrices = (prices: number[]) => {
  // https://stackoverflow.com/a/13368101/761726
  // const mean = _.mean(prices);
  // const _std = std(prices);

  if (prices.length === 0) {
    throw Error(`No prices passed to normalizePrices.`);
  }

  const min = _.min(prices);
  const max = _.max(prices);

  if (!min || !max) {
    throw Error('Did not find a max or min.');
  }

  return prices.map(v => (v - min) / (max - min));
}

export const getTrainingDataForStock = async (symbol: string, sequenceLength: number) => {
  const results = await grabAllPricesBySymbolSortedDesc(symbol);

  let prices = normalizePrices(_.map(results, 'close'));

  return generateSequencesAndLabels(prices, sequenceLength);
  // return generateDatasetFromSequencesAndLabels(sequences, labels);
}
