import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import apiClient from '../services/apiClient';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null); // { resetToken, expiresAt }
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await apiClient.post('/Auth/forgot-password', { email });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToken = () => {
        if (result?.resetToken) {
            navigator.clipboard.writeText(result.resetToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container glass-card animate-fade-in fp-container">
                <Link to="/login" className="back-link">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="auth-header">
                    <div className="fp-icon"><KeyRound size={32} /></div>
                    <h2>Forgot Password?</h2>
                    <p>Enter your email address and we'll generate a reset token for you.</p>
                </div>

                {!result ? (
                    <>
                        {error && <div className="auth-error">{error}</div>}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        className="input-field"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        id="forgot-email-input"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading} id="send-reset-btn">
                                {loading ? <span className="spinner"></span> : <><KeyRound size={18} /> Generate Reset Token</>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="reset-token-box animate-fade-in">
                        <div className="token-success-icon"><CheckCircle2 size={40} color="#10B981" /></div>
                        <h3>Your Reset Token</h3>
                        <p className="token-subtitle">Copy this token and use it on the Reset Password page. It expires in <strong>15 minutes</strong>.</p>

                        <div className="token-display">
                            <span className="token-value" id="reset-token-value">{result.resetToken}</span>
                            <button
                                className={`copy-btn ${copied ? 'copied' : ''}`}
                                onClick={copyToken}
                                id="copy-token-btn"
                                title="Copy token"
                            >
                                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <Link
                            to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.resetToken)}`}
                            className="btn btn-primary w-full"
                            id="go-to-reset-btn"
                            style={{ marginTop: '1.5rem', display: 'inline-flex', justifyContent: 'center' }}
                        >
                            Continue to Reset Password →
                        </Link>
                    </div>
                )}

                <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
                    <p>Remember your password? <Link to="/login" className="text-primary">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
