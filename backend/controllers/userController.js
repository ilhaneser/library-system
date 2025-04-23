const User = require('../models/User');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Start session 
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(req.session.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  req.session.destroy();
  res.json({ message: 'User logged out' });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(req.session.user.id).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add book to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { bookId } = req.body;
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if book is already in wishlist
    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }
    
    // Add to wishlist
    user.wishlist.push(bookId);
    await user.save();
    
    res.json({ message: 'Book added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove book from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const bookId = req.params.bookId;
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if book is in wishlist
    if (!user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: 'Book not in wishlist' });
    }
    
    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    await user.save();
    
    res.json({ message: 'Book removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Check if a book is in user's wishlist
exports.checkWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const bookId = req.params.bookId;
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isInWishlist = user.wishlist.includes(bookId);
    
    res.json({ isInWishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};