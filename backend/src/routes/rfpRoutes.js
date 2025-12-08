const express = require('express');
const {
  createRFP,
  getAllRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  sendRFPToVendors,
} = require('../controllers/rfpController');

const router = express.Router();

router.post('/', createRFP);
router.get('/', getAllRFPs);
router.get('/:id', getRFPById);
router.put('/:id', updateRFP);
router.delete('/:id', deleteRFP);
router.post('/:id/send', sendRFPToVendors);

module.exports = router;
