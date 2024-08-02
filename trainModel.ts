import _ from 'lodash';
import * as tf from '@tensorflow/tfjs-node';
import { generateDatasetFromSequencesAndLabels, getTrainingDataForStock } from './trainingDataGenerator';
import { createModel, trainModel } from './util/modelCreator';
import { grabAllSymbols } from './grabPrices';

const sequenceLength = 6;

export const predict = (
  model: tf.LayersModel,
  sequence: number[],
): number => {
  const buf = tf.buffer([1, sequence.length, 1]);

  _.map(sequence, (x, i) => {
    buf.set(x, 0, i, 0);
  });

  return (model.predict(buf.toTensor()) as any).dataSync();
}


const modelFolder = 'file://../models';
const getModelPath = (symbol: string, sequenceLength: number) => {
  const modelPath = `${modelFolder}/${symbol}.${sequenceLength}`;
  return modelPath;
}

const createTrainAndSaveModel = async (symbol: string, sequenceLength: number) => {
  const model = createModel(sequenceLength);

  const trainingData = await getTrainingDataForStock(symbol, sequenceLength);
  const { sequences, labels } = generateDatasetFromSequencesAndLabels(trainingData.sequences, trainingData.labels);
  await trainModel(model, sequences, labels);

  // Memory clean up: Dispose the training data.
  sequences.dispose();
  labels.dispose();

  const modelPath = getModelPath(symbol, sequenceLength);
  await model.save(modelPath);

  return model;
}

const loadModel = async (symbol: string, sequenceLength: number) => {
  const model = await tf.loadLayersModel(`${getModelPath(symbol, sequenceLength)}/model.json`);
  return model;
}

(async () => {
  const symbol = 'SPY';
  for (const symbol of await grabAllSymbols()) {
    try {
      console.log(symbol);

      /*
      const model = await createTrainAndSaveModel(symbol, sequenceLength);
      */


      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(1000)
    }
    catch (e) {
      console.error(symbol, e)
    }
  }

  // const model = await createTrainAndSaveModel(symbol, sequenceLength);
  // // const model = await tf.loadLayersModel(`${getModelPath(symbol, sequenceLength)}/model.json`);
  // const trainingData = await getTrainingDataForStock(symbol, sequenceLength);

  // _.map(trainingData.sequences, (x, i) => {
  //   const prediction = predict(model, trainingData.sequences[i]);
  //   console.log(`Label: ${trainingData.labels[i]} Prediction: ${prediction}`);
  // });
})();
