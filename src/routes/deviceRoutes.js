const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Get all devices
router.get('/', deviceController.getDevices);

// Get device by ID
router.get('/:id', deviceController.getDeviceById);

// Create device
router.post('/', deviceController.createDevice);

// Update device
router.put('/:id', deviceController.updateDevice);

// Delete device
router.delete('/:id', deviceController.deleteDevice);

// Generate QR code for device
router.post('/:id/generate-qr', deviceController.generateQRCode);

// Download QR code
router.get('/:id/download-qr', deviceController.downloadQRCode);

module.exports = router;