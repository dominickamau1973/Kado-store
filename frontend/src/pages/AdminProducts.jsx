import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../services/productService";

import { useAuth } from "../context/AuthContext";

const initialFormData = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "0",
};

const AdminProducts = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);

      setError(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setImageFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setError("");
    setSuccessMessage("");
  };

  // Reset the form
  const resetForm = () => {
    setFormData({ ...initialFormData });
    setImageFile(null);
    setEditingProductId(null);
    setError("");
    setSuccessMessage("");
  };

  // Add or update a product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const name = formData.name.trim();
    const description = formData.description.trim();
    const image = formData.image.trim();
    const category = formData.category.trim();

    if (!name || !description || !category) {
      setError("Please complete the name, description, and category fields.");
      return;
    }

    if (!image && !imageFile) {
      setError("Please provide an image URL or select an image file.");
      return;
    }

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      setError("Please enter a valid price of zero or more.");
      return;
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }

    try {
      setSaving(true);

      // Keep the existing URL unless a new image file is selected.
      let finalImage = image;

      // Upload the selected file first.
      if (imageFile) {
        const uploadData = await uploadProductImage(imageFile);

        if (!uploadData.imageUrl) {
          throw new Error("The image upload did not return an image URL.");
        }

        finalImage = uploadData.imageUrl;
      }

      // Build the product using your actual Mongoose schema.
      const productData = {
        name,
        description,
        price: Number(formData.price),
        image: finalImage,
        category,
        stock: Number(formData.stock),
      };

      if (editingProductId) {
        const data = await updateProduct(editingProductId, productData);

        const savedProduct = data.product || data;

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product._id === editingProductId ? savedProduct : product,
          ),
        );

        setSuccessMessage("Product updated successfully.");
      } else {
        const data = await createProduct(productData);

        const savedProduct = data.product || data;

        setProducts((currentProducts) => [savedProduct, ...currentProducts]);

        setSuccessMessage("Product created successfully.");
      }

      // Reset the form without clearing the success message.
      setFormData({ ...initialFormData });
      setImageFile(null);
      setEditingProductId(null);
    } catch (error) {
      console.error("Error saving product:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Load a product into the form for editing
  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setImageFile(null);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      image: product.image || "",
      category: product.category || "",
      stock: String(product.stock ?? 0),
    });

    setError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete a product
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(product._id);
      setError("");
      setSuccessMessage("");

      await deleteProduct(product._id);

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item._id !== product._id),
      );

      if (editingProductId === product._id) {
        setFormData({ ...initialFormData });
        setEditingProductId(null);
      }

      setSuccessMessage("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);

      setError(error.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  // Restrict the page to administrators
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>

        <p className="text-gray-600 mb-6">
          You need to log in to manage products.
        </p>

        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>

        <p className="text-gray-600">
          Only administrators can manage products.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>

          <p className="text-gray-600 mt-2">
            Add, edit, and manage your store inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProducts}
          className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
        >
          Refresh Products
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div
          role="alert"
          className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg px-4 py-3"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-6 border border-green-300 bg-green-50 text-green-700 rounded-lg px-4 py-3"
        >
          {successMessage}
        </div>
      )}

      {/* Add/Edit Product form */}
      <div className="border rounded-xl bg-white shadow-sm p-6 mb-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">
            {editingProductId ? "Edit Product" : "Add New Product"}
          </h2>

          {editingProductId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Nike Air Max 270"
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Shoes"
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price (KSh)
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="12999"
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Available Stock
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                placeholder="25"
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
            /* Image URL */
            <div className="md:col-span-2">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Image URL
              </label>

              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                required={!imageFile}
                className="w-full border rounded-lg px-4 py-3"
              />

              {formData.image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Image preview</p>

                  <img
                    src={formData.image}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = "block";
                    }}
                  />
                </div>
              )}
            </div>
            {/* Upload Image File */}
            <div className="md:col-span-2">
              <label
                htmlFor="imageFile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Or Upload an Image
              </label>

              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="w-full border rounded-lg px-4 py-3"
              />

              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, or WEBP. Maximum file size: 5 MB. Selecting a file
                will replace the image URL when you save.
              </p>

              {imageFile && (
                <p className="text-sm text-blue-600 mt-2">
                  Selected image: {imageFile.name}
                </p>
              )}
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows={4}
                required
                className="w-full border rounded-lg px-4 py-3 resize-y"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingProductId
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingProductId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product list */}
      <div>
        <h2 className="text-xl font-semibold mb-5">
          Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="border rounded-xl p-10 text-center">
            <p className="text-gray-600">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="border rounded-xl bg-white shadow-sm overflow-hidden"
              >
                {/* Image */}
                <div className="h-56 bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product information */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{product.name}</h3>

                  <p className="text-sm text-blue-600 mt-1">
                    {product.category}
                  </p>

                  <p className="text-gray-600 mt-2">{product.description}</p>

                  <p className="text-xl font-bold mt-3">
                    KSh {Number(product.price).toLocaleString()}
                  </p>

                  <p
                    className={`text-sm mt-2 ${
                      product.stock > 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    Stock: {product.stock}
                    {product.stock === 0 && " — Out of stock"}
                  </p>

                  <p className="text-xs text-gray-400 mt-2 break-all">
                    ID: {product._id}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={deletingProductId === product._id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingProductId === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
