import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';
import './SignupPage.css';

function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    allergens: [],
    vegetarian: false,
    vegan: false,
    dietaryRestrictions: [],
    agreedToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && (name === 'vegetarian' || name === 'vegan')) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // If vegan is checked, vegetarian must also be true
        ...(name === 'vegan' && checked ? { vegetarian: true } : {})
      }));
    } else if (type === 'checkbox' && name === 'agreedToTerms') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'select-multiple' && name === 'allergens') {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, allergens: options }));
    } else if (type === 'select-multiple' && name === 'dietaryRestrictions') {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, dietaryRestrictions: options }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.endsWith('@ucla.edu')) {
      newErrors.email = 'Please use your UCLA email address (@ucla.edu)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain upper, lower, and a number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseId = userCredential.user.uid;
      // Compose user data for backend
      const userData = {
        firebaseId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        username: formData.username,
        email: formData.email,
        allergens: formData.allergens,
        vegetarian: formData.vegetarian,
        vegan: formData.vegan,
        dietaryRestrictions: formData.dietaryRestrictions
      };
      // Register user in backend
      await apiService.users.signup(userData);
      navigate('/preferences');
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/preferences');
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h2>Sign Up</h2>
            <p>Create your account</p>
          </div>
          {errors.general && <div className="general-error">{errors.general}</div>}
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  disabled={loading}
                  autoComplete="given-name"
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  disabled={loading}
                  autoComplete="family-name"
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">UCLA Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((show) => !show)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="allergens">Allergens (hold Ctrl/Cmd to select multiple)</label>
              <select
                id="allergens"
                name="allergens"
                multiple
                value={formData.allergens}
                onChange={handleChange}
                className="allergens-select"
                disabled={loading}
              >
                <option value="peanuts">Peanuts</option>
                <option value="tree nuts">Tree Nuts</option>
                <option value="dairy">Dairy</option>
                <option value="eggs">Eggs</option>
                <option value="soy">Soy</option>
                <option value="wheat">Wheat</option>
                <option value="fish">Fish</option>
                <option value="shellfish">Shellfish</option>
                <option value="sesame">Sesame</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dietaryRestrictions">Dietary Restrictions (hold Ctrl/Cmd to select multiple)</label>
              <select
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                multiple
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                className="dietary-select"
                disabled={loading}
              >
                <option value="kosher">Kosher</option>
                <option value="halal">Halal</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="vegetarian"
                  checked={formData.vegetarian}
                  onChange={handleChange}
                  disabled={loading}
                />
                Vegetarian
              </label>
              <label style={{ marginLeft: '1rem' }}>
                <input
                  type="checkbox"
                  name="vegan"
                  checked={formData.vegan}
                  onChange={handleChange}
                  disabled={loading}
                />
                Vegan
              </label>
            </div>
            <div className="form-group terms-agreement">
              <input
                type="checkbox"
                id="agreedToTerms"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="agreedToTerms">
                I agree to the <a href="/terms" className="terms-link" target="_blank" rel="noopener noreferrer">terms and conditions</a>
              </label>
              {errors.agreedToTerms && <div className="error-message">{errors.agreedToTerms}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <button className="btn btn-google" onClick={handleGoogleSignup} disabled={loading} style={{marginTop: '1rem', width: '100%'}}>
            Sign up with Google
          </button>
          <div style={{marginTop: '1rem', textAlign: 'center'}}>
            Already have an account? <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;