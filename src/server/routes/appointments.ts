import { Router } from 'express';
import { Appointment } from '../../models/Appointment';
import { User } from '../../models/User';
import { auth, adminOnly } from '../middleware/auth';

const router = Router();

// Get all appointments (admin only)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    console.log('Fetching all appointments for admin');
    const appointments = await Appointment.find()
      .sort({ date: -1, time: -1 }) // Sort by date and time in descending order
      .populate({
        path: 'userId', 
        model: 'User',
        select: 'fullName email phone' // Only select the fields we need
      });
    
    // Transform the data to include client details
    const appointmentsWithClientDetails = appointments.map(apt => {
      const user = apt.userId as any; // Type assertion for populated user
      return {
        _id: apt._id,
        userId: apt.userId,
        date: apt.date,
        time: apt.time,
        caseType: apt.caseType,
        status: apt.status,
        notes: apt.notes,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
        clientName: user?.fullName || 'Unknown',
        clientEmail: user?.email || 'Unknown',
        clientPhone: user?.phone || 'Not provided'
      };
    });

    console.log(`Found ${appointmentsWithClientDetails.length} appointments`);
    return res.json(appointmentsWithClientDetails);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    return res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Get appointments for current user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId })
      .sort({ date: -1, time: -1 });
    
    if (!appointments) {
      return res.status(404).json({ message: 'No appointments found' });
    }
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { userId, date, time, caseType, notes } = req.body;

    // Create appointment
    const appointment = new Appointment({
      userId,
      date,
      time,
      caseType,
      notes,
      status: 'pending'
    });

    await appointment.save();

    // Add appointment to user's appointments array
    await User.findByIdAndUpdate(
      userId,
      { $push: { appointments: appointment._id } }
    );

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
});

// Update appointment status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating appointment status:', { id, status });

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'fullName email phone'
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Transform the response to include client details
    const user = appointment.userId as any;
    const appointmentWithClientDetails = {
      ...appointment.toObject(),
      clientName: user?.fullName || 'Unknown',
      clientEmail: user?.email || 'Unknown',
      clientPhone: user?.phone || 'Not provided'
    };

    console.log('Appointment updated:', appointmentWithClientDetails);
    res.json(appointmentWithClientDetails);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Failed to update appointment status' });
  }
});

// Reschedule appointment
router.patch('/:id/reschedule', auth, async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        date, 
        time,
        status: 'pending', // Reset status to pending after rescheduling
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
});

export default router; 