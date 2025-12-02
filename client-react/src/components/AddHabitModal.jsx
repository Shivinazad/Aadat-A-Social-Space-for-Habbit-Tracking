import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { habitsAPI } from '../services/api';
import '../styles/AddHabitModal.css';

const AddHabitModal = ({ isOpen, onClose, onSuccess }) => {
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('');
  const [description, setDescription] = useState('');
  const [createRoadmap, setCreateRoadmap] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateHabit = async () => {
    if (!habitTitle.trim()) {
      setError('Habit title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Create habit with roadmap flag
      await habitsAPI.create({
        habitTitle,
        habitCategory: habitCategory || 'Personal',
        description,
        generateRoadmap: createRoadmap,
      });
      
      // Reset form
      setHabitTitle('');
      setHabitCategory('');
      setDescription('');
      setCreateRoadmap(false);
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create habit:', err);
      setError(err.response?.data?.msg || 'Failed to create habit. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setHabitTitle('');
    setHabitCategory('');
    setDescription('');
    setCreateRoadmap(false);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay-glass"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="modal-card-compact"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={handleClose}>
              <FiX />
            </button>

            <h2 className="modal-title-compact">Create New Habit</h2>

            {error && (
              <motion.div
                className="modal-error-compact"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div className="modal-form-compact">
              <div className="form-group-compact">
                <label htmlFor="habitTitle">Habit Title</label>
                <input
                  id="habitTitle"
                  type="text"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g., Morning Run"
                  className="form-input-glass"
                  autoFocus
                />
              </div>

              <div className="form-group-compact">
                <label htmlFor="habitCategory">
                  Category <span style={{ color: 'var(--gray-400)', fontWeight: '400' }}>(Optional)</span>
                </label>
                <input
                  id="habitCategory"
                  type="text"
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  placeholder="e.g., Fitness, Learning, Health"
                  className="form-input-glass"
                />
              </div>

              <div className="form-group-compact">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="form-textarea-glass"
                  rows="4"
                />
              </div>

              <div className="checkbox-group-glass" onClick={() => setCreateRoadmap(!createRoadmap)}>
                <input
                  type="checkbox"
                  id="createRoadmap"
                  checked={createRoadmap}
                  onChange={(e) => setCreateRoadmap(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="createRoadmap">
                  Create AI Roadmap
                  <span className="ai-badge">AI</span>
                </label>
              </div>

              <div className="modal-actions-compact">
                <button
                  onClick={handleClose}
                  className="btn-cancel-glass"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateHabit}
                  disabled={isCreating || !habitTitle.trim() || !description.trim()}
                  className="btn-create-glass"
                >
                  {isCreating ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddHabitModal;
