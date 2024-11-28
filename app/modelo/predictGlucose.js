// pages/api/predictGlucose.js
import * as tf from '@tensorflow/tfjs';

let model;

async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel('model.json'); // Aquí se carga el modelo previamente entrenado
  }
  return model;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { glucoseLevel, ateSomething, foodMeal, date } = req.body;

    const model = await loadModel();

    const inputData = [
      glucoseLevel,
      ateSomething ? 1 : 0,
      foodMeal === 'desayuno' ? 1 : foodMeal === 'almuerzo' ? 2 : 3,
      new Date(date).getHours(),
    ];

    const prediction = model.predict(tf.tensor2d([inputData], [1, 4])).dataSync()[0];
    
    res.status(200).json({ predictedGlucose: prediction });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
