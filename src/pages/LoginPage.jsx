import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import logo from "../assets/images/logo.png"; // your image path
import { ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();

  // States
  const [role, setRole] = useState('citizen'); // 'admin', 'citizen', 'authority'
  const [registering, setRegistering] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle login/registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loader for all scenarios

    try {
      if (role === 'admin') {
        const res = await axios.post('https://nivaran-backend-zw9j.onrender.com/admin/login', {
          adminId,
          password,
        });
        if (res.data.message?.toLowerCase().includes('login successful')) {
          localStorage.setItem('adminToken', res.data.token);
          localStorage.setItem('isAdminLoggedIn', 'true');
          toast.success('Login successful!', {
            duration: 4000,
            position: 'top-right',
            style: {
              background: 'rgba(255, 228, 230, 0.3)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(254, 205, 211, 0.5)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              color: '#be123c',
              padding: '12px 24px',
              margin: '8px',
            },
          });
          navigate('/homepage');
        } else {
          throw new Error('Login failed');
        }
      } else if (role === 'authority') {
        const res = await axios.post('https://nivaran-backend-zw9j.onrender.com/api/authorities/login', {
          email,
          password,
        });
        localStorage.setItem('authorityToken', res.data.token);
        localStorage.setItem('authorityName', res.data.authority.name);
        localStorage.setItem('authorityType', res.data.authority.type);
        toast.success(res.data.message, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: 'rgba(255, 228, 230, 0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(254, 205, 211, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            color: '#be123c',
            padding: '12px 24px',
            margin: '8px',
          },
        });
        navigate('/authority/dashboard');
      } else if (role === 'citizen') {
        if (registering) {
          // Step 1: Send OTP for registration
          if (!otpSent) {
            if (!fullName || !email || !password) {
              toast('Please fill all fields to register!', {
                duration: 4000,
                position: 'top-right',
                style: {
                  background: 'rgba(255, 228, 230, 0.3)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(254, 205, 211, 0.5)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  color: '#be123c',
                  padding: '12px 24px',
                  margin: '8px',
                },
              });
              setLoading(false);
              return;
            }
            const res = await axios.post('https://nivaran-backend-zw9j.onrender.com/api/citizens/register', {
              fullName,
              email,
              password,
            });
            toast.success('OTP sent to your email. Please verify.', {
              duration: 4000,
              position: 'top-right',
              style: {
                background: 'rgba(255, 228, 230, 0.3)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(254, 205, 211, 0.5)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: '#be123c',
                padding: '12px 24px',
                margin: '8px',
              },
            });
            setOtpSent(true);
            setLoading(false);
            return;
          } else {
            // Step 2: Verify OTP
            if (!otp) {
              toast('Please enter the OTP sent to your email!', {
                duration: 4000,
                position: 'top-right',
                style: {
                  background: 'rgba(255, 228, 230, 0.3)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(254, 205, 211, 0.5)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  color: '#be123c',
                  padding: '12px 24px',
                  margin: '8px',
                },
              });
              setLoading(false);
              return;
            }
            await axios.post('https://nivaran-backend-zw9j.onrender.com/api/citizens/verify-otp', { email, otp });
            toast.success('Email verified! Logging you in...', {
              duration: 4000,
              position: 'top-right',
              style: {
                background: 'rgba(255, 228, 230, 0.3)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(254, 205, 211, 0.5)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: '#be123c',
                padding: '12px 24px',
                margin: '8px',
              },
            });

            // Auto-login with the same credentials
            setTimeout(async () => {
              try {
                const loginRes = await axios.post('https://nivaran-backend-zw9j.onrender.com/api/citizens/login', {
                  email,
                  password,
                });
                localStorage.setItem('citizenToken', loginRes.data.token);
                toast.success(loginRes.data.message, {
                  duration: 4000,
                  position: 'top-right',
                  style: {
                    background: 'rgba(255, 228, 230, 0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(254, 205, 211, 0.5)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    color: '#be123c',
                    padding: '12px 24px',
                    margin: '8px',
                  },
                });
                navigate('/citizen/dashboard');
              } catch (loginErr) {
                console.error('Auto-login failed:', loginErr);
                toast.error('Auto-login failed. Please login manually.', {
                  duration: 4000,
                  position: 'top-right',
                  style: {
                    background: 'rgba(255, 228, 230, 0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(254, 205, 211, 0.5)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    color: '#be123c',
                    padding: '12px 24px',
                    margin: '8px',
                  },
                });
                setOtpSent(false); // Allow retry
                setLoading(false);
              }
            }, 1000); // 1 second delay
          }
        } else {
          // Normal citizen login
          if (!email || !password) {
            toast('Please enter both email and password!', {
              duration: 4000,
              position: 'top-right',
              style: {
                background: 'rgba(255, 228, 230, 0.3)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(254, 205, 211, 0.5)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: '#be123c',
                padding: '12px 24px',
                margin: '8px',
              },
            });
            setLoading(false);
            return;
          }
          const res = await axios.post(
            'https://nivaran-backend-zw9j.onrender.com/api/citizens/login',
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
          );
          localStorage.setItem('citizenToken', res.data.token);
          toast.success(res.data.message, {
            duration: 4000,
            position: 'top-right',
            style: {
              background: 'rgba(255, 228, 230, 0.3)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(254, 205, 211, 0.5)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              color: '#be123c',
              padding: '12px 24px',
              margin: '8px',
            },
          });
          navigate('/citizen/dashboard');
        }
      }
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || 'Something went wrong', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: 'rgba(255, 228, 230, 0.3)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(254, 205, 211, 0.5)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          color: '#be123c',
          padding: '12px 24px',
          margin: '8px',
        },
      });
    }
    setLoading(false); // Stop loader after all scenarios
  };

  // Login form fields based on role
  const renderLoginFormFields = () => {
    if (role === 'admin') {
      return (
        <>
          <label className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">Admin ID</label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
            autoComplete="off"
          />
          <label className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
            autoComplete="off"
          />
        </>
      );
    } else {
      return (
        <>
          <label htmlFor="email" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
            autoComplete="off"
          />
          <label htmlFor="password" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
            autoComplete="off"
          />
        </>
      );
    }
  };

  // Citizen registration fields
  const renderRegisterFormFields = () => {
    if (otpSent) {
      return (
        <>
          <label htmlFor="otp" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">Enter OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
            autoComplete="off"
          />
        </>
      );
    }
    return (
      <>
        <label htmlFor="fullName" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
          autoComplete="off"
        />
        <label htmlFor="email" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
          autoComplete="off"
        />
        <label htmlFor="password" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-xl py-2 px-3 mb-4 bg-white focus:ring-2 focus:ring-rose-400 text-sm md:text-base"
          autoComplete="off"
        />
      </>
    );
  };

  return (
    <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row m-0 p-0 overflow-hidden bg-gradient-to-br from-rose-50 to-pink-100">
      <Toaster />
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-rose-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-rose-700 text-lg font-semibold">Processing...</p>
          </div>
        </div>
      )}

      <div className="w-full h-full flex flex-col lg:flex-row">
        {/* Left Info Section with Background Image and Pink Overlay */}
        <div
          className="w-full lg:w-1/2 h-[40vh] lg:h-full relative flex items-center justify-center"
          style={{
            backgroundImage: `url(${logo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/70 via-rose-500/60 to-pink-700/70 mix-blend-multiply"></div>
          <div className="relative z-10 text-center px-4 py-4 sm:px-6 sm:py-6 md:px-12 md:py-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg max-w-sm sm:max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg"
            >
              Welcome to Nivaran
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-4 text-base sm:text-lg lg:text-xl text-white/90 font-medium"
            >
              "Your Voice, Our Action"
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-2 text-sm sm:text-base text-white/80"
            >
              Nivaran is a citizen-driven complaint management platform that empowers communities to report, track, and resolve local issues efficiently.
            </motion.p>
          </div>
        </div>

        {/* Right Login/Register Form */}
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-full p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col justify-center bg-rose-50/30 backdrop-blur-md relative">
          <div className="absolute inset-y-0 left-0 w-16 lg:w-24 bg-gradient-to-r from-pink-500/20 to-transparent z-10 hidden lg:block"></div>
          {/* Role Selector */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            {['citizen', 'admin', 'authority'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setRegistering(false);
                  setOtpSent(false);
                  setAdminId('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                  setOtp('');
                  setLoading(false);
                }}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all border border-rose-200 shadow-sm ${
                  role === r ? 'bg-rose-500 text-white' : 'text-rose-700 hover:bg-rose-100/50'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Animated Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${registering}-${otpSent}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-white rounded-xl py-4 sm:py-6 border border-rose-200 shadow-lg"
            >
              {registering && (
                <div className="flex justify-start mb-2 px-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistering(false);
                      setOtpSent(false);
                      setFullName('');
                      setEmail('');
                      setPassword('');
                      setOtp('');
                    }}
                    className="p-2 rounded-full hover:bg-rose-300 transition-colors duration-300"
                  >
                    <ArrowLeft size={20} className="text-rose-700" />
                  </button>
                </div>
              )}
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center text-rose-700">
                {registering ? (otpSent ? 'Verify OTP' : 'Citizen Registration') : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
              </h1>
              <form onSubmit={handleSubmit} className="flex flex-col items-center">
                {registering ? renderRegisterFormFields() : renderLoginFormFields()}
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-2 px-4 w-11/12 sm:w-3/5 mx-auto text-sm md:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {registering ? (otpSent ? 'Verify OTP' : 'Register') : 'Login'}
                </button>
              </form>

              {/* Toggle Registration */}
              <div className="mt-4 sm:mt-6 text-rose-600 text-center h-8">
                {role === 'citizen' && !registering && !otpSent && (
                  <button
                    onClick={() => setRegistering(true)}
                    className="hover:underline cursor-pointer bg-transparent border-none text-rose-600 font-semibold text-xs sm:text-sm md:text-base"
                  >
                    Register as Citizen
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;