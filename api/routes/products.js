const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Prodcut = require("../models/product");

router.get("/", (req, res, next) => {
  Prodcut.find()
    .select("name price _id")
    .exec()
    .then(result => {
      const response = {
        count: result.length,
        prducts: result.map(ele => {
          return {
            _id: ele._id,
            name: ele.name,
            price: ele.price,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + ele._id
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

router.post("/", (req, res, next) => {
  const product = new Prodcut({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  product
    .save()
    .then(result => {
      res.status(201).json({
        message: "Created succesfully",
        createdProduct: {
          _id: result._id,
          name: result.name,
          price: result.price,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id
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

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Prodcut.findById(id)
    .select("name price _id")
    .exec()
    .then(result => {
      if (result) {
        res.status(200).json({
          product: result,
          request: {
            type: "GET",
            description: "Get all products",
            url: "http://localhost:3000/products/"
          }
        });
      } else {
        res.status(404).json({
          message: "No valid entry found for provided ID"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  //   console.log(updateOps);

  Prodcut.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Product updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;

  Prodcut.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product deleted",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/"
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
