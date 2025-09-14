import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';
import { UploadCloud, X, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [images, setImages] = useState([]); // {file, preview, verifying, isSafe}
  const [composerError, setComposerError] = useState('');
  const [nsfwModel, setNsfwModel] = useState(null);
  const [toast, setToast] = useState(null);

  // Load NSFW model
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

  // Generate preview URLs & clean up on unmount
  useEffect(() => {
    const withPreview = images.map(img => ({
      ...img,
      preview: img.preview || URL.createObjectURL(img.file),
    }));
    setImages(withPreview);

    return () => {
      withPreview.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

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

    // Run NSFW check
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
      setComposerError('Please fill all fields and ensure images are safe.');
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
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl text-white font-semibold text-base shadow-xl backdrop-blur-md border border-rose-300/50 z-50
            ${toast.type === 'success' ? 'bg-rose-600/95' : 'bg-red-600/95'}`}
        >
          {toast.message}
        </motion.div>
      )}

      <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-600 mb-8 border-b-2 border-rose-300/50 pb-3 backdrop-blur-sm">
        Register a Complaint
      </h2>
      <div className="bg-rose-100/30 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 md:p-10 border border-rose-300/50 space-y-8">
        {/* Title */}
        <div>
          <label className="block text-lg font-medium text-rose-800 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => e.target.value.length <= MAX_TITLE && setTitle(e.target.value)}
            placeholder="Short, clear title"
            className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm"
          />
          <span className="text-sm text-gray-600 mt-2 block">{titleCount}</span>
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-medium text-rose-800 mb-2">Description</label>
          <textarea
            value={desc}
            onChange={(e) => e.target.value.length <= MAX_DESC && setDesc(e.target.value)}
            placeholder="Describe the problem"
            rows={6}
            className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm resize-y"
          />
          <span className="text-sm text-gray-600 mt-2 block">{descCount}</span>
        </div>

        {/* Location */}
        <div>
          <label className="block text-lg font-medium text-rose-800 mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm"
          />
        </div>

        {/* Complaint Type */}
        <div>
          <label className="block text-lg font-medium text-rose-800 mb-2">Complaint Type</label>
          <select
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full border border-rose-300/50 rounded-xl px-4 py-3 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-400 text-gray-800 text-base shadow-sm"
          >
            <option value="">Select type</option>
            {COMPLAINT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-lg font-medium text-rose-800 mb-3">Severity</label>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`rounded-xl border px-4 py-2 text-base font-semibold transition-all duration-200 hover:shadow-md ${
                  severity === level
                    ? 'border-rose-500 bg-rose-100/50 text-rose-700'
                    : 'border-rose-300/50 text-rose-700 hover:bg-rose-100/50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Anonymous */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-5 w-5 rounded border-rose-300/50 text-rose-600 focus:ring-rose-400 bg-rose-50/50"
            />
            <span className="text-base text-rose-700 flex items-center">
              Post as Anonymous
              <Shield size={18} className="ml-2 text-rose-500" />
            </span>
          </div>
          <p className="text-base text-rose-600/80 italic">
            Your information will remain private and visible only to administrators for review.
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-lg font-medium text-rose-800 mb-3">Images (optional)</label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed border-rose-300/50 rounded-2xl p-6 sm:p-8 text-center bg-rose-50/30 backdrop-blur-sm transition-all duration-200 hover:bg-rose-100/50"
          >
            <UploadCloud className="mx-auto mb-3 text-rose-500" size={28} />
            <p className="text-base text-rose-700">
              Drag & drop images here, or
              <label className="text-rose-600 font-semibold cursor-pointer ml-1 hover:underline">
                browse
                <input type="file" accept={ACCEPTED_IMG_TYPES.join(',')} multiple className="hidden" onChange={onFileInputChange} />
              </label>
            </p>
            <p className="text-sm text-gray-600 mt-2">Up to {MAX_IMAGES} images (png, jpg, jpeg, webp, gif)</p>
          </div>

          {images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-rose-300/50 bg-rose-50/30 shadow-sm">
                  {img.preview ? (
                    <img src={img.preview} alt={`upload-${idx}`} className="w-full h-20 sm:h-32 object-cover" />
                  ) : (
                    <div className="w-full h-20 sm:h-32 flex items-center justify-center bg-rose-50/50 text-gray-600 text-sm">No preview</div>
                  )}
                  {img.verifying && (
                    <span className="absolute top-2 left-2 bg-yellow-400/90 text-black text-xs sm:text-sm px-2 py-1 rounded-full">Verifying...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute top-2 right-2 bg-rose-100/90 hover:bg-rose-200/90 rounded-full p-1.5 shadow-md transition-all duration-200"
                  >
                    <X size={18} className="text-rose-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {composerError && (
          <p className="text-base text-red-600 bg-red-50/50 rounded-lg px-4 py-2 border border-red-300/50">{composerError}</p>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={clearComposer}
            className="px-5 sm:px-6 py-2.5 rounded-xl border border-rose-300/50 text-rose-700 bg-rose-50/50 hover:bg-rose-100/50 font-semibold text-base transition-all duration-200 hover:shadow-md"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmitComplaint}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:shadow-md ${
              canSubmit ? 'bg-rose-600 hover:bg-rose-700' : 'bg-rose-300 cursor-not-allowed'
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