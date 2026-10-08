const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    experimentName: {
      type: String,
      required: [true, 'Experiment name is required'],
      trim: true
    },
    material: {
      type: String,
      required: [true, 'Material is required'],
      trim: true
    },
    thermalConductivity: {
      type: Number,
      default: 0
    },
    density: {
      type: Number,
      default: 0
    },
    specificHeat: {
      type: Number,
      default: 0
    },
    rodLength: {
      type: Number,
      default: 0.5 // meters
    },
    rodDiameter: {
      type: Number,
      default: 0.025 // meters
    },
    heaterVoltage: {
      type: Number,
      default: 0
    },
    heaterPower: {
      type: Number,
      default: 0
    },
    coolingWaterFlow: {
      type: Number,
      default: 0
    },
    sensorReadings: {
      t1: { type: Number, default: 20 },
      t2: { type: Number, default: 20 },
      t3: { type: Number, default: 20 },
      t4: { type: Number, default: 20 },
      t5: { type: Number, default: 20 },
      t6: { type: Number, default: 20 },
      t7: { type: Number, default: 20 },
      t8: { type: Number, default: 20 },
      t9: { type: Number, default: 20 }
    },
    temperatureGradient: {
      type: Number,
      default: 0
    },
    heatRemoved: {
      type: Number,
      default: 0
    },
    experimentStatus: {
      type: String,
      enum: ['IN_PROGRESS', 'STEADY_STATE', 'COMPLETED', 'SUBMITTED'],
      default: 'COMPLETED'
    },
    observationsCount: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Experiment', experimentSchema);
