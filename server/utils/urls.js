const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = {
  getClientUrl
};