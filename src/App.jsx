import { useReducer, useEffect } from "react";

function App() {
  // ---------- REDUCER ----------
  const reducer = (state, action) => {
    switch (action.type) {
      case "FETCH_START":
        return { ...state, loading: true, error: null };
      case "FETCH_SUCCESS":
        return { ...state, loading: false, products: action.payload };
      case "FETCH_ERROR":
        return { ...state, loading: false, error: action.payload };
      case "ADD_TO_CART": {
        const mavjud = state.cart.find((item) => item.id === action.payload.id);
        if (mavjud) {
          return {
            ...state,
            cart: state.cart.map((item) =>
              item.id === action.payload.id
                ? { ...item, qty: item.qty + 1 }
                : item
            ),
          };
        }
        return {
          ...state,
          cart: [...state.cart, { ...action.payload, qty: 1 }],
        };
      }
      case "REMOVE_FROM_CART":
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== action.payload),
        };
      case "INCREASE_QTY":
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      case "DECREASE_QTY":
        return {
          ...state,
          cart: state.cart
            .map((item) =>
              item.id === action.payload
                ? { ...item, qty: item.qty - 1 }
                : item
            )
            .filter((item) => item.qty > 0),
        };
      case "CLEAR_CART":
        return { ...state, cart: [] };
      default:
        return state;
    }
  };

  const initialState = {
    products: [],
    cart: [],
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // ---------- API'DAN YUKLASH ----------
  useEffect(() => {
    const fetchProducts = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const res = await fetch("https://fakestoreapi.com/products?limit=6");
        if (!res.ok) throw new Error("Server xatosi");
        const data = await res.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_ERROR", payload: err.message });
      }
    };
    fetchProducts();
  }, []);

  // ---------- HISOB-KITOBLAR ----------
  const totalPrice = state.cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER (Cart yozuvi) */}
        <h1 className="text-xl font-semibold mb-6 text-gray-700">Cart</h1>

        {/* SHOPPING CART SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <span className="bg-[#eef2ff] text-[#4f46e5] text-xs font-semibold px-3 py-1.5 rounded-full">
              {totalItems} Products
            </span>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* CART ITEMS */}
          {state.cart.length === 0 ? (
            <p className="text-gray-400 py-6 text-center">Savat bo'sh</p>
          ) : (
            <div className="space-y-4 mb-8">
              {state.cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[#4f46e5] font-bold text-sm">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quantity Control */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          dispatch({ type: "INCREASE_QTY", payload: item.id })
                        }
                        className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-bold"
                      >
                        +
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          dispatch({ type: "DECREASE_QTY", payload: item.id })
                        }
                        className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-bold"
                      >
                        -
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() =>
                        dispatch({ type: "REMOVE_FROM_CART", payload: item.id })
                      }
                      className="text-red-400 hover:text-red-600 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className="border-gray-200 mb-6" />

          {/* TOTAL & CHECKOUT */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-semibold">Total:</span>
            <span className="text-2xl font-extrabold text-[#4f46e5]">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold py-3.5 rounded-xl transition duration-200">
            Checkout
          </button>
        </div>

        {/* PRODUCTS LIST */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Products list</h2>

        {state.loading && <p className="text-gray-500">Yuklanmoqda...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {state.products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 relative group"
            >
              {/* "New" Badge */}
              <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                New
              </span>

              <div className="h-40 flex items-center justify-center mb-4 mt-2">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                {p.title}
              </h3>
              <p className="text-gray-500 font-bold mb-4">
                ${p.price.toFixed(2)}
              </p>

              <button
                onClick={() => dispatch({ type: "ADD_TO_CART", payload: p })}
                className="w-full bg-gray-50 hover:bg-[#4f46e5] hover:text-white text-gray-700 font-semibold text-sm py-2.5 rounded-lg transition-colors duration-200"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;