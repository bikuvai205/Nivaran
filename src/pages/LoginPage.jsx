import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/images/logo.png"; // your image path

const LoginPage = () => {
  const navigate = useNavigate();

  // States
  const [role, setRole] = useState('citizen'); // 'admin', 'citizen', 'authority'
  const [registering, setRegistering] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [email, setEmail] = useState(''); // For authority and citizen login
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // For citizen registration
  const [loginMessage, setLoginMessage] = useState('');

  // Handle login/registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage(''); // Clear previous messages

    try {
      if (role === 'admin') {
        const res = await axios.post('http://localhost:5000/admin/login', {
          adminId,
          password,
        });
        if (res.data.message?.toLowerCase().includes('login successful')) {
          localStorage.setItem('adminToken', res.data.token);
          localStorage.setItem('isAdminLoggedIn', 'true');
          navigate('/homepage');
        } else {
          setLoginMessage('❌ Login failed. Please try again.');
        }
      } else if (role === 'authority') {
        const res = await axios.post('http://localhost:5000/api/authorities/login', {
          email,
          password,
        });
        localStorage.setItem('authorityToken', res.data.token);
        localStorage.setItem('authorityName', res.data.authority.name);
        localStorage.setItem('authorityType', res.data.authority.type);
        navigate('/authority/dashboard');
      } else if (role === 'citizen') {
        if (registering) {
          // Citizen registration
          const res = await axios.post('http://localhost:5000/api/citizens/register', {
            fullName,
            email,
            password,
          });
          setLoginMessage('✅ Registration successful! You can now login.');
          setRegistering(false);
        } else {
          // Citizen login
          if (!email || !password) {
            setLoginMessage('⚠️ Please enter both email and password!');
            return;
          }
          const res = await axios.post(
            'http://localhost:5000/api/citizens/login',
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
          );
          localStorage.setItem('citizenToken', res.data.token);
          setLoginMessage(`🎉 ${res.data.message}`);
          navigate('/citizen/dashboard');
        }
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setLoginMessage(err.response?.data?.message || '❌ Something went wrong');
    }
  };

  // Login form fields based on role
  const renderLoginFormFields = () => {
    if (role === 'admin') {
      return (
        <>
          <label className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto">Admin ID</label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-md py-2 px-3 mb-4 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-300"
            autoComplete="off"
          />
        </>
      );
    } else {
      return (
        <>
          <label htmlFor="email" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-md py-2 px-3 mb-4 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-300"
            autoComplete="off"
          />
        </>
      );
    }
  };

  // Citizen registration fields
  const renderRegisterFormFields = () => (
    <>
      <label htmlFor="fullName" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-md py-2 px-3 mb-4 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-300"
        autoComplete="off"
      />
      <label htmlFor="email" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-md py-2 px-3 mb-4 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-300"
        autoComplete="off"
      />
      <label htmlFor="password" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto">
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-md py-2 px-3 mb-4 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-300"
        autoComplete="off"
      />
    </>
  );

  return (
    <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row m-0 p-0 overflow-hidden">
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
          {/* Pink overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/70 via-rose-500/60 to-pink-700/70 mix-blend-multiply"></div>

          {/* Text block */}
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
              Add Your Voice, Our Action
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
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-full p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center bg-rose-50/30 backdrop-blur-md">
          {/* Role Selector */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            {['citizen', 'admin', 'authority'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setRegistering(false);
                  setLoginMessage('');
                  setAdminId('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border border-rose-200 shadow-sm ${
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
              key={`${role}-${registering}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-rose-100/30 backdrop-blur-md rounded-xl py-4 sm:py-6 border border-rose-200 shadow-lg"
            >
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center text-rose-700">
                {registering ? 'Citizen Registration' : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
              </h1>
              <form onSubmit={handleSubmit} className="flex flex-col items-center">
                {registering ? renderRegisterFormFields() : renderLoginFormFields()}
                {!registering && (
                  <>
                    <label htmlFor="password" className="block text-rose-700 mb-1 w-11/12 sm:w-3/5 mx-auto">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-11/12 sm:w-3/5 mx-auto border border-rose-200 rounded-md py-2 px-3 mb-4 bg-rose-50/50 backdrop-blur-sm focus:ring-2 focus:ring-rose-300"
                      autoComplete="off"
                    />
                  </>
                )}
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-md py-2 px-4 w-11/12 sm:w-3/5 mx-auto"
                >
                  {registering ? 'Register' : 'Login'}
                </button>
                {loginMessage && <p className="text-xs sm:text-sm text-center text-rose-600 mt-4">{loginMessage}</p>}
              </form>

              {/* Toggle Registration */}
              <div className="mt-4 sm:mt-6 text-rose-600 text-center h-8">
                {role === 'citizen' && !registering && (
                  <button
                    onClick={() => setRegistering(true)}
                    className="hover:underline cursor-pointer bg-transparent border-none text-rose-600 font-semibold text-xs sm:text-sm"
                  >
                    Register as Citizen
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;