import Product from "../models/Product.js";

//Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

//Get a single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Create a product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock = 0 } = req.body ?? {};
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      typeof name !== "string" || !name.trim() ||
      typeof description !== "string" || !description.trim() ||
      price === undefined || price === null || price === "" ||
      !Number.isFinite(numericPrice) || numericPrice < 0 ||
      typeof image !== "string" || !image.trim() ||
      typeof category !== "string" || !category.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid name, description, price, image, and category fields",
      });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      image: image.trim(),
      category: category.trim(),
      stock: numericStock,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: "Server error while creating product",
    });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};
