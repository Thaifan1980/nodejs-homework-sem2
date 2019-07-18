const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

const auth = require("../middleware/auth");

router.get("/", auth, (req, res, next) => {
  Order.find()
    .select("userId product quantity _id")
    .populate("product", ["name", "price"])
    .exec()
    .then(result => {
      const response = {
        count: result.length,
        orders: result.map(ele => {
          return {
            _id: ele._id,
            userId: ele.userId,
            product: ele.product,
            quantity: ele.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + ele._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", auth, (req, res, next) => {
  console.log(req.userData);
  Product.findById(req.body.product)
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: "Product not found"
        });
      }
      //   console.log(result);
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.product,
        userId: req.userData.userId,
        quantity: req.body.quantity
      });

      return order.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Created succesfully",
        createdOrder: {
          _id: result._id,
          product: result.product,
          user: result.user,
          quantity: result.quantity,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders/" + result._id
          }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:orderId", auth, (req, res, next) => {
  const id = req.params.orderId;
  const userData = req.userData;

  Order.findOne({ _id: id, userId: userData.userId })
    .select("product quantity _id")
    .populate("product", ["name", "price"])
    .exec()
    .then(result => {
      if (result) {
        res.status(200).json({
          order: result,
          request: {
            type: "GET",
            description: "Get all orders",
            url: "http://localhost:3000/orders/"
          }
        });
      } else {
        res.status(404).json({
          message: "Order not found"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:orderId", auth, (req, res, next) => {
  const id = req.params.orderId;
  const userData = req.userData;

  Order.findOneAndRemove({ _id: id, userId: userData.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
