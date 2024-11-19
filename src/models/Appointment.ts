import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  caseType: {
    type: String,
    enum: ['corporate', 'family', 'civil', 'criminal', 'real_estate', 'intellectual_property'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true,
  collection: 'Appointments'
});

export const Appointment = mongoose.model('Appointment', appointmentSchema); 