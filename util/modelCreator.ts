import * as tf from '@tensorflow/tfjs-node';

export const createModel = (sequenceLength: number) => {
  const model = tf.sequential();

  // For reference in case we want to use an LSTM again.
  // https://towardsdatascience.com/predicting-stock-prices-using-a-keras-lstm-model-4225457f0233

  // https://towardsdatascience.com/stock-price-prediction-system-using-1d-cnn-with-tensorflow-js-machine-learning-easy-and-fun-fe5323e68ffb
  model.add(tf.layers.inputLayer({
    inputShape: [sequenceLength, 1]
  }));

  model.add(tf.layers.conv1d({
    kernelSize: 2,
    filters: 128,
    strides: 1,
    useBias: true,
    activation: 'relu',
    kernelInitializer: 'VarianceScaling'
  }));

  model.add(tf.layers.averagePooling1d({
    poolSize: [2],
    strides: [1]
  }));

  model.add(tf.layers.conv1d({
    kernelSize: 2,
    filters: 64,
    strides: 1,
    useBias: true,
    activation: 'relu',
    kernelInitializer: 'VarianceScaling'
  }));

  model.add(tf.layers.averagePooling1d({
    poolSize: [2],
    strides: [1]
  }));

  model.add(tf.layers.flatten({}));

  model.add(tf.layers.dense({
    units: 1,
    kernelInitializer: 'VarianceScaling',
    activation: 'linear'
  }))

  return model;
}

export const trainModel = async (model: tf.Sequential, sequences: tf.Tensor, labels: tf.Tensor) => {
  // Compile model to prepare for training.
  const learningRate = 4e-3;
  // const optimizer = tf.train.rmsprop(learningRate);
  const optimizer = tf.train.adam(learningRate);
  // const optimizer = tf.train.momentum(learningRate, learningRate)
  model.compile({
    loss: 'meanSquaredError',
    // optimizer: optimizer,
    optimizer: 'adam'
    // https://js.tensorflow.org/api/latest/#metrics.meanSquaredError
    // metrics: ['acc']
  });

  console.log('Training model...');
  const fitOutput = await model.fit(
    sequences, labels, {
    epochs: 30,
    // validationSplit: 0.30,
    // batchSize: 10,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        // Update the UI to display the current loss and accuracy values.
        console.dir(logs);
        console.log(`train-epoch ${epoch + 1}`);

        /*
        console.log(`train-loss ${logs?.loss.toFixed(4)}`);
        console.log(`train-acc ${logs?.acc.toFixed(4)}`);

        console.log(`val-loss ${logs?.val_loss.toFixed(4)}`);
        console.log(`val-acc ${logs?.val_acc.toFixed(4)}`);
        */
      }
    }
  });
}
