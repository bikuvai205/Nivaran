import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [role, setRole] = useState('citizen'); // 'citizen', 'admin', 'authority'
  const [registering, setRegistering] = useState(false); // false = login, true = register for citizen only

  const renderLoginFormFields = () => {
    if (role === 'citizen') {
      return (
        <>
          <label htmlFor="email" className="block text-gray-700 mb-1 w-3/5 mx-auto">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 focus:outline-none focus:border-amber-500 bg-white"
            autoComplete="off"
          />
        </>
      );
    } else {
      return (
        <>
          <label htmlFor="id" className="block text-gray-700 mb-1 w-3/5 mx-auto">
            ID
          </label>
          <input
            type="text"
            id="id"
            name="id"
            className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 focus:outline-none focus:border-amber-500 bg-white"
            autoComplete="off"
          />
        </>
      );
    }
  };

  const renderRegisterFormFields = () => (
    <>
      <label htmlFor="fullName" className="block text-gray-700 mb-1 w-3/5 mx-auto">
        Full Name
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 focus:outline-none focus:border-amber-500 bg-white"
        autoComplete="off"
      />

      <label htmlFor="email" className="block text-gray-700 mb-1 w-3/5 mx-auto">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 focus:outline-none focus:border-amber-500 bg-white"
        autoComplete="off"
      />

      <label htmlFor="password" className="block text-gray-700 mb-1 w-3/5 mx-auto">
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 focus:outline-none focus:border-amber-500 bg-white"
        autoComplete="off"
      />
    </>
  );

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex flex-col lg:flex-row justify-center items-center h-[100vh] py-5 px-5 overflow-hidden">
      <div className="rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row w-full max-w-6xl h-full bg-white">
        {/* Left Hero Section */}
        <div className="w-full lg:w-[40%] h-full flex flex-col justify-center items-center bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 text-center p-10 select-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-amber-700 mb-4"
          >
            Nivaran
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-base lg:text-lg text-gray-700 max-w-xs mx-auto"
          >
            Your trusted digital platform for citizen grievances, authority coordination, and admin resolution.
          </motion.p>
        </div>

        {/* Right Form Section */}
        <div className="w-full lg:w-[60%] p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            {['citizen', 'admin', 'authority'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setRegistering(false); // reset to login form when role changes
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all border shadow-sm ${
                  role === r
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-700 hover:bg-yellow-100'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Animated form container with permanent glassy lifted effect */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${registering}`} // key includes registering state so animation triggers on toggle
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-white bg-opacity-30 backdrop-blur-md rounded-xl py-8 border border-white border-opacity-30 shadow-lg"
              style={{
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                WebkitBackdropFilter: 'blur(8.5px)',
                backdropFilter: 'blur(8.5px)',
                borderRadius: '1rem',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <h1 className="text-2xl font-semibold mb-6 text-center text-amber-700">
                {registering
                  ? 'Citizen Registration'
                  : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
              </h1>

              <form action="#" method="POST" className="flex flex-col items-center">
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
                      className="w-3/5 mx-auto border border-gray-300 rounded-md py-2 px-3 mb-4 focus:outline-none focus:border-amber-500 bg-white"
                      autoComplete="off"
                    />
                  </>
                )}

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md py-2 px-4 w-3/5 mx-auto"
                >
                  {registering ? 'Register' : 'Login'}
                </button>
              </form>

              {/* Register link (only for citizen login, fixed height to prevent layout jump) */}
              <div className="mt-6 text-amber-600 text-center h-8">
                {role === 'citizen' && !registering && (
                  <button
                    onClick={() => setRegistering(true)}
                    className="hover:underline cursor-pointer bg-transparent border-none text-amber-600 font-semibold"
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
