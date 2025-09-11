// src/pages/citizen/RegisterComplaint.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';
import { UploadCloud, X, Shield } from 'lucide-react';

const MAX_TITLE = 120;
const MAX_DESC = 2000;
const MAX_IMAGES = 4;
const ACCEPTED_IMG_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const NSFW_THRESHOLD = 0.6;
const COMPLAINT_TYPES = [
  'Roads',
  'Garbage/Waste/Pollution',
  'Water',
  'Electricity',
  'Street Animal',
  'Traffic',
  'Maintenance',
  'Infrastructure',
  'Environmental',
  'Other',
];

const RegisterComplaint = ({ citizen, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [complaintType, setComplaintType] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [composerError, setComposerError] = useState('');
  const [nsfwModel, setNsfwModel] = useState(null);
  const [toast, setToast] = useState(null);

  // Load NSFWJS model
  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('cpu');
      const model = await nsfwjs.load();
      setNsfwModel(model);
    };
    loadModel();
  }, []);

  // Character counters
  const titleCount = useMemo(() => `${title.length}/${MAX_TITLE}`, [title]);
  const descCount = useMemo(() => `${desc.length}/${MAX_DESC}`, [desc]);

  // Handle image previews
  useEffect(() => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    const next = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  const checkNSFW = async (file) => {
    if (!nsfwModel) return { isSafe: true };
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      const predictions = await nsfwModel.classify(img);
      URL.revokeObjectURL(url);
      const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];
      const nsfwPrediction = predictions.find(
        (pred) => nsfwCategories.includes(pred.className) && pred.probability >= NSFW_THRESHOLD
      );
      if (nsfwPrediction) return { isSafe: false, nsfwType: nsfwPrediction.className };
      return { isSafe: true };
    } catch (err) {
      console.error('NSFW check error:', err);
      return { isSafe: true };
    }
  };

  const acceptFiles = async (fileList) => {
    setComposerError('');
    const files = Array.from(fileList || []);
    const validFiles = files.filter((f) => ACCEPTED_IMG_TYPES.includes(f.type));
    const rejected = files.length - validFiles.length;
    if (rejected > 0) setComposerError(`Some files were rejected (allowed: png, jpg, jpeg, webp, gif).`);

    const newImages = validFiles.slice(0, MAX_IMAGES).map(f => ({ file: f, verifying: true, isSafe: true }));
    setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));

    // Run NSFW check asynchronously
    newImages.forEach(async (img) => {
      const { isSafe } = await checkNSFW(img.file);
      setImages(prev => prev.map(i =>
        i.file === img.file ? { ...i, verifying: false, isSafe } : i
      ));
      if (!isSafe) setComposerError('Inappropriate image found. Please remove it.');
    });
  };

  const onFileInputChange = (e) => acceptFiles(e.target.files);
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    acceptFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const removeImageAt = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const clearComposer = () => {
    setTitle('');
    setDesc('');
    setLocation('');
    setSeverity('medium');
    setAnonymous(false);
    setComplaintType('');
    setImages([]);
    setComposerError('');
  };

  const canSubmit = title.trim() && desc.trim() && location.trim() && complaintType.trim();

  const handleSubmitComplaint = async () => {
    if (!canSubmit) {
      setComposerError('Please provide a title, description, location, and type.');
      return;
    }
    try {
      const token = localStorage.getItem('citizenToken');
      if (!token) {
        setComposerError('No token found. Please log in again.');
        return;
      }
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', desc.trim());
      formData.append('location', location.trim());
      formData.append('severity', severity);
      formData.append('anonymous', anonymous);
      formData.append('complaintType', complaintType);
      images.forEach((img) => formData.append('image', img));
      const res = await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const newComplaint = res.data.complaint || res.data;
      if (onSubmitSuccess) onSubmitSuccess(newComplaint);
      clearComposer();
      setToast({ message: 'Complaint submitted successfully!', type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error('Submit complaint error:', err);
      const message = err.response?.data?.message || 'Failed to submit complaint.';
      setToast({ message, type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="relative p-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-xl text-white font-semibold shadow-lg transition-transform transform animate-slideIn ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
      <h2 className="mb-4 text-2xl font-bold text-rose-600">Register a Complaint</h2>
      <div className="space-y-5 rounded-2xl border border-rose-100 bg-white p-6 shadow-xl">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => e.target.value.length <= MAX_TITLE && setTitle(e.target.value)}
              placeholder="Short, clear title"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <span className="text-xs text-gray-500">{titleCount}</span>
          </div>
        </div>
        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={desc}
            onChange={(e) => e.target.value.length <= MAX_DESC && setDesc(e.target.value)}
            placeholder="Describe the problem"
            rows={5}
            className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <span className="text-xs text-gray-500">{descCount}</span>
        </div>
        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location of the issue"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        {/* Complaint Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Complaint Type</label>
          <select
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">Select type</option>
            {COMPLAINT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Severity</label>
          <div className="grid grid-cols-3 gap-3">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  severity === level
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-300 text-gray-700 hover:border-rose-300 hover:text-rose-700'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Anonymous */}
        <div className="flex items-start gap-3">
          <label className="inline-flex cursor-pointer select-none items-center">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
            />
            <span className="ml-2 flex items-center text-sm text-gray-800">
              Post as Anonymous
              <Shield size={16} className="ml-2 text-rose-500" />
            </span>
          </label>
          <p className="text-xs text-gray-500">
            Your identity will be hidden from other citizens. Admins can still view your details for verification and action.
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Images (optional)</label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-6 text-center"
          >
            <UploadCloud className="mb-2" />
            <p className="text-sm text-gray-700">
              Drag & drop images here, or
              <label className="ml-1 cursor-pointer font-semibold text-rose-700">
                browse
                <input
                  type="file"
                  accept={ACCEPTED_IMG_TYPES.join(',')}
                  multiple
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Up to {MAX_IMAGES} images. PNG, JPG, JPEG, WEBP, GIF.
            </p>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {imagePreviews.map((src, idx) => (
                <div
                  key={src}
                  className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <img src={src} alt={`upload-${idx}`} className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow hover:bg-white"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Error */}
        {composerError && <p className="text-sm text-red-600">{composerError}</p>}
        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={clearComposer}
            className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmitComplaint}
            className={`rounded-xl px-5 py-2 font-semibold text-white transition ${
              canSubmit ? 'bg-rose-600 hover:bg-rose-700' : 'cursor-not-allowed bg-rose-300'
            }`}
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterComplaint;
