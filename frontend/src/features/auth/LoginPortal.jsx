import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../api';
import logo from '../../assets/logo/logo.png';
import loginHero from '../../assets/images/login-hero.png';

const LoginPortal = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/auth/login', {
        email: identifier,
        password: password
      });

      // Store the full user object including the database ID and role
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', response.data.user.role);
      } else {
        localStorage.setItem('role', response.data.role);
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      console.log('Login successful:', response.data.message);
      
      const userRole = response.data.user?.role || response.data.role;
      if (userRole === 'Admin' || userRole === 'Dispatcher' || userRole === 'SuperAdmin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'Driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
      
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <div className="hidden lg:flex flex-1 relative bg-gray-900">
        <img src={loginHero} alt="Al-Waqar Fleet" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-start pt-24 px-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">FLEET SYNCHRONIZATION<br />PLATFORM</h1>
          <p className="text-xl max-w-sm font-light text-gray-200">
            Real-time logistics management and asset compliance for the Al-Waqar Transport network.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Al-Waqar Logo" className="h-20 w-auto mb-2" />
            <p className="text-gray-500 font-medium">Operations Management Portal</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email or Phone</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-200 focus:border-[#0B2A4D] focus:ring-2 focus:ring-[#0B2A4D]/20 bg-gray-50 hover:bg-white" 
                placeholder="Enter your email or phone" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-200 focus:border-[#0B2A4D] focus:ring-2 focus:ring-[#0B2A4D]/20 bg-gray-50 hover:bg-white" 
                  placeholder="••••••••" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-2 h-4 w-4 text-[#0B2A4D] border-gray-300 rounded focus:ring-[#0B2A4D]" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-[#0B2A4D] hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#0B2A4D] text-white py-3.5 rounded-lg font-bold text-lg hover:bg-[#153e6d] transition duration-200 shadow-md cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center text-sm space-y-2">
            <p className="text-gray-500">Don't have an account?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <Link to="/register-driver" className="text-[#0B2A4D] font-bold hover:underline">Register as Driver</Link>
              <span className="hidden sm:inline text-gray-300">|</span>
              <Link to="/signup" className="text-[#0B2A4D] font-bold hover:underline">Sign up as Customer</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;