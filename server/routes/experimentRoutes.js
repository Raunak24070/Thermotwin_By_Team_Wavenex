const express = require('express');
const mongoose = require('mongoose');
const Experiment = require('../models/Experiment');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all experiment routes
router.use(authMiddleware);

// @route   GET /api/experiments
// @desc    Get all experiments belonging to the logged-in user (or all if ADMIN)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const filter = req.user.role === 'ADMIN' ? {} : { userId };

    const experiments = await Experiment.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role institution');

    return res.status(200).json({
      success: true,
      count: experiments.length,
      data: experiments
    });
  } catch (error) {
    console.error('[Get Experiments Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve experiments.'
    });
  }
});

// @route   GET /api/experiments/:id
// @desc    Get a single experiment by ID with access control
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experiment ID format.'
      });
    }

    const experiment = await Experiment.findById(id).populate('userId', 'name email role institution');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found.'
      });
    }

    const currentUserId = (req.user.id || req.user._id).toString();
    const ownerId = (experiment.userId._id || experiment.userId).toString();

    // Strict access control: only owner or ADMIN
    if (ownerId !== currentUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this experiment.'
      });
    }

    return res.status(200).json({
      success: true,
      data: experiment
    });
  } catch (error) {
    console.error('[Get Experiment Details Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving experiment details.'
    });
  }
});

// @route   POST /api/experiments
// @desc    Save a new experiment run for the logged-in user
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      experimentName,
      material,
      thermalConductivity,
      density,
      specificHeat,
      rodLength,
      rodDiameter,
      heaterVoltage,
      heaterPower,
      coolingWaterFlow,
      sensorReadings,
      temperatureGradient,
      heatRemoved,
      experimentStatus,
      observationsCount,
      notes
    } = req.body;

    if (!experimentName || !experimentName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Experiment name is required.'
      });
    }

    if (!material || !material.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Material name is required.'
      });
    }

    const newExperiment = await Experiment.create({
      userId,
      experimentName: experimentName.trim(),
      material: material.trim(),
      thermalConductivity: Number(thermalConductivity) || 0,
      density: Number(density) || 0,
      specificHeat: Number(specificHeat) || 0,
      rodLength: Number(rodLength) || 0.5,
      rodDiameter: Number(rodDiameter) || 0.025,
      heaterVoltage: Number(heaterVoltage) || 0,
      heaterPower: Number(heaterPower) || 0,
      coolingWaterFlow: Number(coolingWaterFlow) || 0,
      sensorReadings: sensorReadings || {
        t1: 20, t2: 20, t3: 20, t4: 20, t5: 20,
        t6: 20, t7: 20, t8: 20, t9: 20
      },
      temperatureGradient: Number(temperatureGradient) || 0,
      heatRemoved: Number(heatRemoved) || 0,
      experimentStatus: experimentStatus || 'COMPLETED',
      observationsCount: Number(observationsCount) || 0,
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Experiment saved successfully to MongoDB.',
      data: newExperiment
    });
  } catch (error) {
    console.error('[Save Experiment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred while saving experiment.'
    });
  }
});

// @route   DELETE /api/experiments/:id
// @desc    Delete a saved experiment (owner or ADMIN only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experiment ID format.'
      });
    }

    const experiment = await Experiment.findById(id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found.'
      });
    }

    const currentUserId = (req.user.id || req.user._id).toString();
    const ownerId = experiment.userId.toString();

    // Verify ownership
    if (ownerId !== currentUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own experiments.'
      });
    }

    await Experiment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Experiment deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Experiment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting experiment.'
    });
  }
});

module.exports = router;
