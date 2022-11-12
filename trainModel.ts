import _ from 'lodash';
import * as tf from '@tensorflow/tfjs-node';
import { generateDatasetFromSequencesAndLabels, getTrainingDataForStock } from './trainingDataGenerator';
import { createModel, trainModel } from './util/modelCreator';

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


const modelFolder = '../models/';

(async () => {
  const symbol = 'SPY';

  const createTrainAndSaveModel = async (symbol: string, sequenceLength: number) => {
    const model = createModel(sequenceLength);

    const trainingData = await getTrainingDataForStock(symbol, sequenceLength);
    const { sequences, labels } = generateDatasetFromSequencesAndLabels(trainingData.sequences, trainingData.labels);
    await trainModel(model, sequences, labels);

    // Memory clean up: Dispose the training data.
    sequences.dispose();
    labels.dispose();

    const modelPath = 'file://model';
    await model.save(modelPath);
  }

  const trainingData = await getTrainingDataForStock(symbol, sequenceLength);
  const model = await tf.loadLayersModel('file://model/model.json');
  _.map(trainingData.sequences, (x, i) => {
    const prediction = predict(model, trainingData.sequences[i]);
    console.log(`Label: ${trainingData.labels[i]} Prediction: ${prediction}`);
  });
})();
