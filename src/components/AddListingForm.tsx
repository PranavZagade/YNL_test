"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function AddListingForm() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    type: "",
    availableFrom: "",
    availableTo: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addDoc(collection(db, "listings"), {
        title: formData.title,
        price: formData.price,
        location: formData.location,
        type: formData.type,
        availableFrom: formData.availableFrom
          ? Timestamp.fromDate(new Date(formData.availableFrom))
          : null,
        availableTo: formData.availableTo
          ? Timestamp.fromDate(new Date(formData.availableTo))
          : null,
        description: formData.description,
        createdAt: Timestamp.now(),
      });
      setSuccess(true);
      setFormData({
        title: "",
        price: "",
        location: "",
        type: "",
        availableFrom: "",
        availableTo: "",
        description: "",
      });
    } catch (err) {
      setError("Failed to add listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4 mt-10"
    >
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="type"
        value={formData.type}
        onChange={handleChange}
        placeholder="Type"
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="availableFrom"
        value={formData.availableFrom}
        onChange={handleChange}
        placeholder="Available From"
        type="date"
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="availableTo"
        value={formData.availableTo}
        onChange={handleChange}
        placeholder="Available To"
        type="date"
        required
        className="w-full border p-2 rounded"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        {loading ? "Submitting..." : "Submit Listing"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Listing added successfully!</div>}
    </form>
  );
} 