import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
      {/* Product Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-56 object-cover"
      />

      {/* Product Information */}
      <div className="p-5">
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h2>

        <p className="text-gray-600 text-sm mb-4">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            KSh {product.price.toLocaleString()}
          </span>

          <button
            onClick={() => addToCart(product)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
