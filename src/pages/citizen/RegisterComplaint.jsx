// src/pages/citizen/RegisterComplaint.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';
import {
  UploadCloud,
  X,
  Shield
} from 'lucide-react';

const MAX_TITLE = 120;
const MAX_DESC = 2000;
const MAX_IMAGES = 4;
const ACCEPTED_IMG_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const NSFW_THRESHOLD = 0.8; // Block images with >80% probability of NSFW content

const RegisterComplaint = ({ citizen, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [composerError, setComposerError] = useState('');
  const [nsfwModel, setNsfwModel] = useState(null);

  // Load NSFWJS model
  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('cpu'); // Use CPU backend for simplicity
      const model = await nsfwjs.load();
      setNsfwModel(model);
    };
    loadModel();
  }, []);

  // Composer helpers
  const titleCount = useMemo(() => `${title.length}/${MAX_TITLE}`, [title]);
  const descCount = useMemo(() => `${desc.length}/${MAX_DESC}`, [desc]);

  useEffect(() => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    const next = images.map(file => URL.createObjectURL(file));
    setImagePreviews(next);
    return () => next.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  const checkNSFW = async (file) => {
    if (!nsfwModel) return { isSafe: true, nsfwType: null }; // Skip if model not loaded
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      const predictions = await nsfwModel.classify(img);
      URL.revokeObjectURL(url);

      const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];
      const nsfwPrediction = predictions.find(pred =>
        nsfwCategories.includes(pred.className) && pred.probability >= NSFW_THRESHOLD
      );

      if (nsfwPrediction) {
        return { isSafe: false, nsfwType: nsfwPrediction.className };
      }
      return { isSafe: true, nsfwType: null };
    } catch (err) {
      console.error('NSFW check error:', err);
      return { isSafe: true, nsfwType: null }; // Allow if check fails
    }
  };

  const acceptFiles = async (fileList) => {
    setComposerError('');
    const files = Array.from(fileList || []);
    const validFiles = files.filter(f => ACCEPTED_IMG_TYPES.includes(f.type));
    const rejected = files.length - validFiles.length;
    if (rejected > 0) {
      setComposerError(`Some files were rejected (allowed: png, jpg, jpeg, webp, gif).`);
    }

    const safeFiles = [];
    let nsfwDetected = false;
    let nsfwTypes = [];

    for (const file of validFiles) {
      const { isSafe, nsfwType } = await checkNSFW(file);
      if (isSafe) {
        safeFiles.push(file);
      } else {
        nsfwDetected = true;
        if (nsfwType && !nsfwTypes.includes(nsfwType)) {
          nsfwTypes.push(nsfwType);
        }
      }
    }

    if (nsfwDetected) {
      setComposerError(`Image rejected due to ${nsfwTypes.join(' and ')} content.`);
    }

    const combined = [...images, ...safeFiles].slice(0, MAX_IMAGES);
    if (combined.length > MAX_IMAGES) {
      setComposerError(`You can upload up to ${MAX_IMAGES} images.`);
    }
    setImages(combined);
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
  const removeImageAt = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };
  const clearComposer = () => {
    setTitle('');
    setDesc('');
    setSeverity('medium');
    setAnonymous(false);
    setImages([]);
    setComposerError('');
  };
  const canSubmit = title.trim().length > 0 && desc.trim().length > 0;

  const handleSubmitComplaint = async () => {
    if (!canSubmit) {
      setComposerError('Please provide a title and description.');
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
      formData.append('severity', severity);
      formData.append('anonymous', anonymous);
      images.forEach(img => formData.append('image', img));

      const res = await axios.post(
        'http://localhost:5000/api/citizens/complaints',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Complaint submitted:', res.data);
      alert('Complaint submitted successfully!');
      clearComposer();
      onSubmitSuccess({
        id: Date.now(),
        user: anonymous ? 'Anonymous' : citizen.fullName,
        time: new Date().toLocaleString(),
        content: desc,
        votes: 0,
        userVote: 0,
      });
    } catch (err) {
      console.error('Submit complaint error:', err);
      setComposerError(err.response?.data?.message || 'Failed to submit complaint.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-rose-600 mb-4">Register a Complaint</h2>
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-5 border border-rose-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => e.target.value.length <= MAX_TITLE && setTitle(e.target.value)}
              placeholder="Give a short, clear title for your complaint."
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            />
            <span className="text-xs text-gray-500">{titleCount}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="flex items-start gap-2">
            <textarea
              value={desc}
              onChange={(e) => e.target.value.length <= MAX_DESC && setDesc(e.target.value)}
              placeholder="Describe the problem, location, and any context that helps authority resolve it."
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-y bg-white"
            />
            <span className="text-xs text-gray-500 mt-1">{descCount}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <div className="grid grid-cols-3 gap-3">
            {['low', 'medium', 'high'].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition
                  ${severity === level
                    ? 'border-rose-500 text-rose-700 bg-rose-50'
                    : 'border-gray-300 text-gray-700 hover:border-rose-300 hover:text-rose-700'}`}
              >
                {level === 'low' && 'Low'}
                {level === 'medium' && 'Medium'}
                {level === 'high' && 'High'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <label className="inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
            />
            <span className="ml-2 text-sm text-gray-800 flex items-center">
              Post as Anonymous
              <Shield size={16} className="ml-2 text-rose-500" />
            </span>
          </label>
          <p className="text-xs text-gray-500">
            Your identity will be hidden from other citizens. Admins can still view your details for verification and action.
          </p>
        </div>
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
                <input
                  type="file"
                  accept={ACCEPTED_IMG_TYPES.join(',')}
                  multiple
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500 mt-1">Up to {MAX_IMAGES} images. PNG, JPG, JPEG, WEBP, GIF.</p>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imagePreviews.map((src, idx) => (
                <div key={src} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <img src={src} alt={`upload-${idx}`} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {composerError && <p className="text-sm text-red-600">{composerError}</p>}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={clearComposer}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmitComplaint}
            className={`px-5 py-2 rounded-xl font-semibold text-white transition
              ${canSubmit ? 'bg-rose-600 hover:bg-rose-700' : 'bg-rose-300 cursor-not-allowed'}`}
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterComplaint;