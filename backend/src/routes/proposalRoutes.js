const express = require('express');
const {
  getProposalsByRFP,
  getProposalById,
  compareRFPProposals,
  updateProposal,
  deleteProposal,
  getAllProposals,
} = require('../controllers/proposalController');

const router = express.Router();

router.get('/', getAllProposals);
router.get('/rfp/:rfpId', getProposalsByRFP);
router.get('/rfp/:rfpId/compare', compareRFPProposals);
router.get('/:id', getProposalById);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);

module.exports = router;
