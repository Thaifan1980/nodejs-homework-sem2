const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

const auth = require("../middleware/auth");

router.get("/:userId", auth, (req, res, next) => {
  Order.find({ userId: req.params.userId })
    .select("product quantity _id")
    .populate("product", ["name", "price"])
    .exec()
    .then(result => {
      if (result) {
        res.status(200).json({
          userId: req.params.userId,
          orders: result.map(ele => {
            return {
              orderId: ele._id,
              quantity: ele.quantity,
              product: ele.product,
              request: {
                type: "GET",
                url: "http://localhost:3000/orders/" + ele._id
              }
            };
          })
        });
      } else {
        res.status(404).json({
          message: "Orders not found"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
