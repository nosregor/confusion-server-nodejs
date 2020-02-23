// grab the things we need
const mongoose = require('mongoose');

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    telnum: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    agree: {
      type: Boolean,
    },
    contactType: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// the schema is useless so far
// we need to create a model using it
const Feedbacks = mongoose.model('Feedback', feedbackSchema);

// make this available to our Node applications
module.exports = Feedbacks;
