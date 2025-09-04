import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import userApi from "../../apis/userApi";

const CreateRequirement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    currency: "INR", // Default to INR
    locationPreference: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    budget: "",
  });

  // Popular currencies with their symbols
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
    { code: "DKK", symbol: "kr", name: "Danish Krone" },
    { code: "PLN", symbol: "zł", name: "Polish Zloty" },
    { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
    { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "MXN", symbol: "$", name: "Mexican Peso" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "THB", symbol: "฿", name: "Thai Baht" },
    { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso" },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira" },
    { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
    { code: "EGP", symbol: "£", name: "Egyptian Pound" },
  ];

  const getCurrentCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === formData.currency);
    return currency?.symbol || formData.currency;
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      description: "",
      budget: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Strip HTML tags for validation - check if there's actual text content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = formData.description;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (!textContent.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = "Please enter a valid budget amount";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description, // Send HTML directly
        ...(formData.budget && {
          budget: Number(formData.budget),
          currency: formData.currency,
        }),
        ...(formData.locationPreference && {
          locationPreference: formData.locationPreference.trim(),
        }),
      };

      const response = await userApi.post("/user/requirements", payload);

      if (response.data.success) {
        navigate("/requirements");
      }
    } catch (error: any) {
      console.error("Error creating requirement:", error);
      // Handle error - you might want to show a snackbar here
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .ql-editor {
          min-height: 120px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          padding: 16px;
        }
        .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 8px 16px;
        }
        .ql-container {
          border: none;
          font-family: inherit;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          left: 16px;
        }
      `}</style>
      <div className="bg-gray-50 w-full h-full">
        {/* Header */}
        <div className="bg-grey01 px-3 py-5">
          <div className="flex items-center justify-between">
            <div className="text-darkBg space-x-3 flex items-center">
              <Icon
                onClick={() => navigate(-1)}
                icon="proicons:arrow-left"
                width="24"
                height="24"
                className="cursor-pointer"
              />
              <p className="font-medium">Create Requirement</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 w-full h-full relative overflow-y-scroll no-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6 h-full">
            {/* Title Field */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Requirement Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter requirement title"
                className={`w-full px-4 py-3 bg-white rounded-full focus:outline-none`}
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <div className="bg-white rounded-xl overflow-hidden">
                <ReactQuill
                  value={formData.description}
                  onChange={(value: string) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: value,
                    }));
                    // Clear error when user starts typing
                    if (errors.description) {
                      setErrors((prev) => ({
                        ...prev,
                        description: "",
                      }));
                    }
                  }}
                  placeholder="Describe your requirement"
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["clean"],
                    ],
                  }}
                  formats={["bold", "italic", "underline", "list", "bullet"]}
                  style={{
                    height: "120px",
                    marginBottom: "42px",
                  }}
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Budget Field */}
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Budget (Optional)
              </label>
              <div className="flex gap-2">
                {/* Currency Dropdown */}
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="px-3 py-3 bg-white rounded-full focus:outline-none"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </option>
                  ))}
                </select>

                {/* Budget Input */}
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getCurrentCurrencySymbol()}
                  </span>
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="Enter budget amount"
                    className="w-full pl-8 pr-4 py-3 bg-white rounded-full focus:outline-none"
                  />
                </div>
              </div>
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Location Preference Field */}
            <div>
              <label
                htmlFor="locationPreference"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location Preference (Optional)
              </label>
              <input
                type="text"
                id="locationPreference"
                name="locationPreference"
                value={formData.locationPreference}
                onChange={handleInputChange}
                placeholder="e.g., Remote, Mumbai, Delhi, etc."
                className="w-full px-4 py-3 bg-white rounded-full focus:outline-none"
                maxLength={100}
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData.locationPreference.length}/100 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Requirement"
                )}
              </button>
            </div>
          </form>

          <div className="h-40"></div>
        </div>
      </div>
    </>
  );
};

export default CreateRequirement;
