const PaymentStatusLog = require('../models/PaymentStatusLog');

exports.addBlockchainTransaction = async (req, res) => {
  try {
    const log = new PaymentStatusLog(req.body);
    await log.save();
    return res.status(201).json(log);
  } catch (err) {
    console.error('Failed to save log:', err);
    return res.status(500).json({ message: 'Failed to save transaction log' });
  }
};

exports.getBlockchainTransactions = async (req, res) => {
  try {
    const logs = await PaymentStatusLog
      .find()
      .sort({ time: -1 })        // sort by your `time` field
      .limit(10)
      .lean();
    console.log('Returning logs:', logs);
    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load blockchain transactions' });
  }
};
