let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

const getIo = () => ioInstance;

const emitDataChanged = (payload = {}) => {
  if (!ioInstance) return;
  ioInstance.emit('data:changed', { ...payload, ts: Date.now() });
};

const emitUserDataChanged = (userId, payload = {}) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId.toString()}`).emit('data:changed', {
    ...payload,
    userId: userId.toString(),
    ts: Date.now()
  });
};

module.exports = {
  setIo,
  getIo,
  emitDataChanged,
  emitUserDataChanged
};
