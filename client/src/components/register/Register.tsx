import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Loader } from 'lucide-react';
import axios from '../../api/axios';

const REGISTER_URL = '/register';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('Listener');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Username validation states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    capital: false,
    number: false
  });

  // Log initial component mount
  useEffect(() => {
    console.log('Register component mounted');
    return () => {
      console.log('Register component unmounted');
    };
  }, []);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check username availability
  const checkUsername = async () => {
    console.log('Initiating username check for:', username);
    if (username.length < 3) {
      console.log('Username too short:', username.length);
      setUsernameError('Username must be at least 3 characters long');
      setIsUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      console.log('Making API request to check username');
      const response = await axios.get('/register/${username}');
      const isAvailable = response?.data?.isAvailable == 1 ? true : false;
      //console.log('Username check API response:', data);

      if (response.status < 400) {
        console.log('Username availability:', isAvailable);
        if (!isAvailable) {
          setUsernameError('This username is already taken');
        }
        setIsUsernameAvailable(isAvailable);

      } else {
        console.error('Username check failed:', response.status);
        setUsernameError('Error checking username availability');
        setIsUsernameAvailable(false);
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameError('Error checking username availability');
      setIsUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
      console.log('Username check completed');
    }
  };

  // Debounced username check
  const debouncedCheckUsername = debounce(checkUsername, 500);

  // Handle username change
  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newUsername = e.target.value;
    console.log('Username input changed:', newUsername);
    setUsername(newUsername);

    if (newUsername.trim()) {
      console.log('Triggering debounced username check');
      setIsCheckingUsername(true);
      debouncedCheckUsername(newUsername);
      //checkUsername(newUsername)
    } else {
      console.log('Clearing username validation states');
      setIsUsernameAvailable(null);
      setUsernameError('');
    }
    setIsCheckingUsername(false);
  };

  // Password validation
  const validatePassword = (password: string) => {
    console.log('Validating password');
    const minLength = 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    console.log('Password validation results:', {
      length: password.length >= minLength,
      hasCapital,
      hasNumber
    });

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasCapital) {
      return "Password must contain at least one capital letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    return null;
  };

  // Update password requirements in real-time
  useEffect(() => {
    console.log('Updating password requirements');
    const newRequirements = {
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      number: /[0-9]/.test(password)
    };
    console.log('New password requirements state:', newRequirements);
    setPasswordRequirements(newRequirements);
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    /*
    // Log the entire form state
    console.log('=== Registration Form Submission ===');
    console.log('Form Data:', {
      username,
      passwordLength: password.length,
      confirmPasswordLength: confirmPassword.length,
      userType,
      isUsernameAvailable,
      passwordRequirements
    });

    // Validation checks
    
    if (!isUsernameAvailable) {
      console.log('Registration blocked: Username not available');
      setError('Please choose a different username');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      console.log('Registration blocked: Password validation failed -', passwordError);
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      console.log('Registration blocked: Passwords do not match');
      setError("Passwords don't match");
      return;
    }
    */
    try {
      console.log('Sending registration request to API');
      const response = await axios.post(REGISTER_URL,
        JSON.stringify({ username, password, role_id: userType }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false
        }
      );
      if (response.status === 200) {
        console.log("Request successful:", response?.data);
        // Further code to handle successful response
        navigate('/login')
      } else if (response.status === 404) {
        console.log("Resource not found");
      } else {
        console.log(`Unexpected status: ${response.status}`);
      }
      console.log(JSON.stringify(response?.data));
      //console.log(JSON.stringify(response));
      if (response?.data && response?.data?.token) {
        const token = response.data.token;

        // Store the token in localStorage
        localStorage.setItem('token', token);

        // Optionally, return the token or any other data
        //return token;
      }


      console.log('Registration API response status:', response.status);

    } catch (error) {
      console.error('Registration request failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  const RequirementIcon = ({ met }: { met: boolean }) => (
    met ?
      <Check className="w-4 h-4 text-green-500" /> :
      <X className="w-4 h-4 text-red-500" />
  );

  const isRegisterDisabled = !isUsernameAvailable || isCheckingUsername;
  return (
    <div className="flex h-screen bg-[#0B3B24]">
      <div className="w-1/2 p-12 flex flex-col justify-between">
        <Link
          to="/"
          className="text-[#FAF5CE] text-2xl font-bold hover:text-[#FFFAD6] transition-colors duration-300"
        >
          echo
        </Link>
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-bold text-[#FAF5CE] mb-8">Register</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full p-4 rounded-full bg-[#165C3A] text-[#FAF5CE] placeholder-[#8BC4A9]"
                />
                {username && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isCheckingUsername ? (
                      <Loader className="w-5 h-5 text-[#8BC4A9] animate-spin" />
                    ) : isUsernameAvailable ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="text-red-500 text-sm ml-4">{usernameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-full bg-[#165C3A] text-[#FAF5CE] placeholder-[#8BC4A9]"
              />
              <div className="bg-[#0D4C2E] rounded-lg p-4 space-y-2 text-sm text-[#FAF5CE]">
                <h3 className="font-semibold mb-2">Password Requirements:</h3>
                <div className="flex items-center space-x-2">
                  <RequirementIcon met={passwordRequirements.length} />
                  <span className={passwordRequirements.length ? "text-green-500" : "text-red-500"}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <RequirementIcon met={passwordRequirements.capital} />
                  <span className={passwordRequirements.capital ? "text-green-500" : "text-red-500"}>
                    One capital letter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <RequirementIcon met={passwordRequirements.number} />
                  <span className={passwordRequirements.number ? "text-green-500" : "text-red-500"}>
                    At least one number
                  </span>
                </div>
              </div>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 rounded-full bg-[#165C3A] text-[#FAF5CE] placeholder-[#8BC4A9]"
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex items-center space-x-4 text-[#FAF5CE]">
              <span>I am a:</span>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="bg-[#165C3A] rounded-full p-2 px-4"
              >
                <option>Listener</option>
                <option>Artist</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={false /*isRegisterDisabled*/}
              className={`w-full p-4 rounded-full text-[#FAF5CE] ${false /*!isUsernameAvailable || isCheckingUsername */
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#4a8f4f] hover:bg-[#5aa55f]'} `}
            >
              Register
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#FAF5CE]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#D17A22] hover:underline">Login</Link>
          </p>
        </div>
        <div></div>
      </div>
      <div className="w-1/2 bg-[#165C3A] flex justify-center items-center relative">
        <img
          src="/assets/undraw_happy_music_g6wc 3 (1).png"
          alt="Happy Music"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.preventDefault();
          }}
        />
      </div>
    </div>
  );
};

export default Register;