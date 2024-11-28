import * as tf from '@tensorflow/tfjs';

const model = tf.sequential();

// Añadir una capa densa con una unidad
model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [4] }));

// Añadir más capas si es necesario
model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

// Capa de salida para predecir el nivel de glucosa
model.add(tf.layers.dense({ units: 1 }));

// Compilar el modelo
model.compile({
  optimizer: 'adam',
  loss: 'meanSquaredError',
  metrics: ['mae']
});

// Función para entrenar el modelo
const trainModel = async (trainingData) => {
  const inputs = trainingData.map((data) => [
    data.glucoseLevel, // Puedes agregar más características aquí
    data.ateSomething ? 1 : 0,
    data.foodMeal === 'desayuno' ? 1 : data.foodMeal === 'almuerzo' ? 2 : 3,
    new Date(data.date).getHours() // hora del día como característica adicional
  ]);

  const labels = trainingData.map((data) => data.glucoseLevel);

  const inputTensor = tf.tensor2d(inputs);
  const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

  // Entrenamos el modelo con los datos
  await model.fit(inputTensor, labelTensor, {
    epochs: 100,
    batchSize: 32,
  });
};

// Función para hacer la predicción
const predictGlucose = (inputData) => {
  const inputTensor = tf.tensor2d([inputData], [1, 4]); // Suponiendo 4 características
  return model.predict(inputTensor).dataSync()[0];
};

// Entrenar el modelo con los datos extraídos de Firebase
trainModel(fetchedData); // fetchedData es el array de registros de glucosa del usuario
