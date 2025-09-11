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
const NSFW_THRESHOLD = 0.8;

const COMPLAINT_TYPES = [
  "Roads", "Garbage/Waste/Pollution", "Water", "Electricity",
  "Street Animal", "Traffic", "Maintenance", "Infrastructure",
  "Environmental", "Others"
];

const RegisterComplaint = ({ citizen, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [complaintType, setComplaintType] = useState('');
  const [images, setImages] = useState([]); // {file, verifying, isSafe}
  const [composerError, setComposerError] = useState('');
  const [nsfwModel, setNsfwModel] = useState(null);
  const [toast, setToast] = useState(null);

  // Load NSFW model in background
  useEffect(() => {
    (async () => {
      try {
        await tf.setBackend('cpu');
        const model = await nsfwjs.load();
        setNsfwModel(model);
      } catch (err) {
        console.error('NSFW model failed to load:', err);
      }
    })();
  }, []);

  const titleCount = useMemo(() => `${title.length}/${MAX_TITLE}`, [title]);
  const descCount = useMemo(() => `${desc.length}/${MAX_DESC}`, [desc]);

  const checkNSFW = async (file) => {
    if (!nsfwModel) return { isSafe: true };
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      const predictions = await nsfwModel.classify(img);
      URL.revokeObjectURL(url);
      const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];
      const nsfwPrediction = predictions.find(pred =>
        nsfwCategories.includes(pred.className) && pred.probability >= NSFW_THRESHOLD
      );
      return { isSafe: !nsfwPrediction };
    } catch (err) {
      console.error('NSFW check error:', err);
      return { isSafe: true };
    }
  };

  const acceptFiles = async (fileList) => {
    setComposerError('');
    const files = Array.from(fileList || []);
    const validFiles = files.filter(f => ACCEPTED_IMG_TYPES.includes(f.type));
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
  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); acceptFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const removeImageAt = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const clearComposer = () => {
    setTitle(''); setDesc(''); setLocation(''); setSeverity('medium');
    setAnonymous(false); setComplaintType(''); setImages([]); setComposerError('');
  };

  const canSubmit = title.trim() && desc.trim() && location.trim() && complaintType.trim() && images.every(i => !i.verifying && i.isSafe);

  const handleSubmitComplaint = async () => {
    if (!canSubmit) {
      setComposerError('Please provide title, description, location, type and ensure all images are safe.');
      return;
    }
    try {
      const token = localStorage.getItem('citizenToken');
      if (!token) { setComposerError('No token found. Please log in again.'); return; }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', desc.trim());
      formData.append('location', location.trim());
      formData.append('severity', severity);
      formData.append('anonymous', anonymous);
      formData.append('complaintType', complaintType);
      images.forEach(img => formData.append('image', img.file));

      const res = await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
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
    <div className="p-6 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded-xl text-white font-semibold shadow-lg
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.message}
        </div>
      )}

      <h2 className="text-2xl font-bold text-rose-600 mb-4">Register a Complaint</h2>
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-5 border border-rose-100">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => e.target.value.length <= MAX_TITLE && setTitle(e.target.value)}
              placeholder="Short, clear title"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            />
            <span className="text-xs text-gray-500">{titleCount}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={desc}
            onChange={(e) => e.target.value.length <= MAX_DESC && setDesc(e.target.value)}
            placeholder="Describe the problem"
            rows={5}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-y bg-white"
          />
          <span className="text-xs text-gray-500">{descCount}</span>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
        </div>

        {/* Complaint Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type</label>
          <select
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          >
            <option value="">Select type</option>
            {COMPLAINT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Images (optional)</label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed border-rose-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-rose-50/40"
          >
            <UploadCloud className="mb-2" />
            <p className="text-sm text-gray-700">
              Drag & drop images here, or
              <label className="text-rose-700 font-semibold cursor-pointer ml-1">
                browse
                <input type="file" accept={ACCEPTED_IMG_TYPES.join(',')} multiple className="hidden" onChange={onFileInputChange} />
              </label>
            </p>
            <p className="text-xs text-gray-500 mt-1">Up to {MAX_IMAGES} images. PNG, JPG, JPEG, WEBP, GIF.</p>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <img src={URL.createObjectURL(img.file)} alt={`upload-${idx}`} className="w-full h-32 object-cover" />
                  {img.verifying && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">Verifying...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow"
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
          <button type="button" onClick={clearComposer} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
            Clear
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmitComplaint}
            className={`px-5 py-2 rounded-xl font-semibold text-white transition ${canSubmit ? 'bg-rose-600 hover:bg-rose-700' : 'bg-rose-300 cursor-not-allowed'}`}
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterComplaint;
