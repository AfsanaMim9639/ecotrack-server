const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'Ongoing', 'Finished'],
    default: 'Not Started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeSchema.index({ status: 1, userId: 1 });

export default mongoose.model('UserChallenge', userChallengeSchema);