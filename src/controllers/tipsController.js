import Tip from '../models/Tip.js';

// Get all tips
export const getAllTips = async (req, res) => {
  try {
    const { category, limit, featured } = req.query;
    
    const filter = {};
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const tips = await Tip.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit) || 10);
    
    res.status(200).json({
      success: true,
      count: tips.length,
      data: tips  // Single .data level
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single tip
export const getTipById = async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }
    
    // Increment views
    tip.views += 1;
    await tip.save();
    
    res.status(200).json({
      success: true,
      data: tip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create tip (optional - for admin)
export const createTip = async (req, res) => {
  try {
    const tip = await Tip.create(req.body);
    
    res.status(201).json({
      success: true,
      data: tip
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Like/Upvote tip
export const likeTip = async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },  // Using 'likes' to match your schema
      { new: true }
    );
    
    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};