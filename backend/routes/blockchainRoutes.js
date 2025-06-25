const router = require('express').Router();
const {
  getBlockchainTransactions,
  addBlockchainTransaction
} = require('../controllers/blockchainController');

router
  .route('/transactions')
  .get(getBlockchainTransactions)
  .post(addBlockchainTransaction);

module.exports = router;
