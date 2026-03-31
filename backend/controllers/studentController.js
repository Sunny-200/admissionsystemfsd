const { getStudentProfile } = require('../services/studentService');  
const { getStudentRemarks } = require('../services/studentService');
const { submitApplication } = require('../services/studentService');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT

    const profile = await getStudentProfile(userId);

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error.message === 'No application found') {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'Failed to fetch profile',
    });
  }
};

const getRemarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const remarks = await getStudentRemarks(userId);

    return res.status(200).json({ remarks });
  } catch (error) {
    console.error('Error fetching student remarks:', error);

    if (error.message === 'Student profile not found') {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'Failed to fetch remarks',
    });
  }
};

const submitApplicationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const result = await submitApplication(userId, data);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      profileId: result.id,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (
      error.message === 'Missing required fields' ||
      error.message === 'Application already submitted'
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

module.exports = { getProfile,getRemarks,submitApplicationController };