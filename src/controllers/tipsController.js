import Tip from '../models/Tip.js';

// Get all tips
export const getAllTips = async (req, res) => {
  try {
    const { category, featured, limit = 10 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const tips = await Tip.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: tips.length,
      data: tips
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

// Create tip
export const createTip = async (req, res) => {
  try {
    const tip = await Tip.create(req.body);

    res.status(201).json({
      success: true,
      data: tip,
      message: 'Tip created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update tip
export const updateTip = async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tip,
      message: 'Tip updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete tip
export const deleteTip = async (req, res) => {
  try {
    const tip = await Tip.findByIdAndDelete(req.params.id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Like tip
export const likeTip = async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
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
      data: tip,
      message: 'Tip liked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};