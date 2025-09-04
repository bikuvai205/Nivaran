import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
          <label className="block text-gray-700 mb-1 w-3/5 mx-auto">Admin ID</label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 bg-white"
            autoComplete="off"
          />
        </>
      );
    } else {
      return (
        <>
          <label htmlFor="email" className="block text-gray-700 mb-1 w-3/5 mx-auto">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 bg-white"
            autoComplete="off"
          />
        </>
      );
    }
  };

  // Citizen registration fields
  const renderRegisterFormFields = () => (
    <>
      <label htmlFor="fullName" className="block text-gray-700 mb-1 w-3/5 mx-auto">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 bg-white"
        autoComplete="off"
      />
      <label htmlFor="email" className="block text-gray-700 mb-1 w-3/5 mx-auto">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 bg-white"
        autoComplete="off"
      />
      <label htmlFor="password" className="block text-gray-700 mb-1 w-3/5 mx-auto">
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 bg-white"
        autoComplete="off"
      />
    </>
  );

  return (
    <div className="bg-gradient-to-br from-rose-50 via-white to-rose-100 flex flex-col lg:flex-row justify-center items-center min-h-screen py-5 px-5 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row bg-white lg:h-[90vh]">
        {/* Left Info Section */}
        <div className="hidden md:flex w-full lg:w-[40%] h-full flex-col justify-center items-center bg-gradient-to-br from-rose-200 via-rose-100 to-rose-300 text-center p-10 select-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-extrabold text-rose-800 mb-4 drop-shadow-sm"
          >
            Nivaran
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-base lg:text-lg text-rose-900 font-medium max-w-xs mx-auto mb-4"
          >
            Nivaran is a digital complaint portal connecting citizens, authorities, and admins.
          </motion.p>
        </div>

        {/* Right Login/Register Form */}
        <div className="w-full lg:w-[60%] p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
          {/* Role Selector */}
          <div className="flex justify-center gap-4 mb-8">
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
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all border shadow-sm ${
                  role === r ? 'bg-rose-500 text-white' : 'text-gray-700 hover:bg-rose-100'
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
              className="w-full bg-white bg-opacity-30 backdrop-blur-md rounded-xl py-8 border border-white border-opacity-30 shadow-lg"
            >
              <h1 className="text-2xl font-semibold mb-6 text-center text-rose-700">
                {registering ? 'Citizen Registration' : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
              </h1>
              <form onSubmit={handleSubmit} className="flex flex-col items-center">
                {registering ? renderRegisterFormFields() : renderLoginFormFields()}
                {!registering && (
                  <>
                    <label htmlFor="password" className="block text-gray-800 mb-1 w-3/5 mx-auto">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 bg-white"
                      autoComplete="off"
                    />
                  </>
                )}
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-md py-2 px-4 w-3/5 mx-auto"
                >
                  {registering ? 'Register' : 'Login'}
                </button>
                {loginMessage && <p className="text-sm text-center text-red-500 mt-4">{loginMessage}</p>}
              </form>

              {/* Toggle Registration */}
              <div className="mt-6 text-rose-600 text-center h-8">
                {role === 'citizen' && !registering && (
                  <button
                    onClick={() => setRegistering(true)}
                    className="hover:underline cursor-pointer bg-transparent border-none text-rose-600 font-semibold"
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