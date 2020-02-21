const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);

const { Currency } = mongoose.Types;

const { Schema } = mongoose;

const promotionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  price: {
    type: Currency,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
