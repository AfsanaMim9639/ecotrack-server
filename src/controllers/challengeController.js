import Challenge from '../models/Challenge.js';

// Get all challenges with advanced filtering and pagination
export const getAllChallenges = async (req, res) => {
  try {
    const {
      category,
      search,
      startDate,
      endDate,
      minParticipants,
      maxParticipants,
      difficulty,
      status,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build filter object
    const filter = {};

    // Category filter (supports multiple categories with $in)
    if (category && category !== 'All') {
      const categories = category.split(',').map(c => c.trim());
      filter.category = { $in: categories };
    }
    
    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter using $gte and $lte
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) {
        filter.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.startDate.$lte = new Date(endDate);
      }
    }

    // Participants range filter using $gte and $lte
    if (minParticipants || maxParticipants) {
      filter.participants = {};
      if (minParticipants) {
        filter.participants.$gte = parseInt(minParticipants);
      }
      if (maxParticipants) {
        filter.participants.$lte = parseInt(maxParticipants);
      }
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    // Status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const challenges = await Challenge.find(filter)
      .sort({ startDate: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Challenge.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: challenges,
      count: challenges.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single challenge by ID
export const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new challenge
export const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      points,
      maxParticipants,
      startDate,
      endDate,
      imageUrl,
      requirements,
      target,
      impactMetric
    } = req.body;

    // Validation
    if (!title || !description || !category || !difficulty || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, difficulty, and duration'
      });
    }

    // Validate duration is positive
    if (parseInt(duration) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be at least 1 day'
      });
    }

    // Validate points is non-negative
    if (points && parseInt(points) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points cannot be negative'
      });
    }

    // Validate dates if both provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Get user email from request (set by auth middleware)
    const createdBy = req.user?.email || req.body.createdBy || 'admin@ecotrack.com';

    // Create challenge object
    const challengeData = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      duration: parseInt(duration),
      points: points ? parseInt(points) : 100,
      target: target ? target.trim() : undefined,
      impactMetric: impactMetric || 'impact units',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      createdBy,
      startDate: startDate ? new Date(startDate) : Date.now(),
      endDate: endDate ? new Date(endDate) : undefined,
      status: 'Active',
      participants: 0
    };

    // Add maxParticipants if provided
    if (maxParticipants && parseInt(maxParticipants) > 0) {
      challengeData.maxParticipants = parseInt(maxParticipants);
    }

    // Add requirements if provided (filter out empty strings)
    if (requirements && Array.isArray(requirements)) {
      const filteredRequirements = requirements
        .filter(req => req && req.trim() !== '')
        .map(req => req.trim());
      
      if (filteredRequirements.length > 0) {
        challengeData.requirements = filteredRequirements;
      }
    }

    const challenge = await Challenge.create(challengeData);

    res.status(201).json({
      success: true,
      data: challenge,
      message: 'Challenge created successfully! 🎉'
    });

  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create challenge. Please try again.',
      error: error.message
    });
  }
};

// Update challenge (PATCH)
export const updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate end date if provided
    if (updates.endDate && updates.startDate) {
      if (new Date(updates.endDate) <= new Date(updates.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Filter out empty requirements if updating requirements
    if (updates.requirements && Array.isArray(updates.requirements)) {
      updates.requirements = updates.requirements
        .filter(req => req && req.trim() !== '')
        .map(req => req.trim());
    }

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: challenge,
      message: 'Challenge updated successfully'
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete challenge
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Challenge deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Increment participant count
export const incrementParticipants = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $inc: { participants: 1 } },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: challenge,
      message: 'Participant added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Decrement participant count
export const decrementParticipants = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Don't let participants go below 0
    if (challenge.participants > 0) {
      challenge.participants -= 1;
      await challenge.save();
    }

    res.status(200).json({
      success: true,
      data: challenge,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};