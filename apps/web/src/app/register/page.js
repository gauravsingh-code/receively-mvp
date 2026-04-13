'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import api from '@/lib/api/client.js';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        self_name: '',
        user_email: '',
        password_hash: '',
        business_name: '',
        currency: 'USD',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = api.post('/api/auth/register', {
                body : {form},
            });

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            // Registration successful → go to login
            router.push('/login');

        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">Receively</h1>
                    <p className="text-gray-500 mt-1">Create your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-800">Register</h2>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Your Name"
                                type="text"
                                name="self_name"
                                placeholder="John Doe"
                                value={form.self_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                name="user_email"
                                placeholder="you@example.com"
                                value={form.user_email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                name="password_hash"
                                placeholder="Min 8 chars, uppercase, lowercase, number"
                                value={form.password_hash}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Business Name (optional)"
                                type="text"
                                name="business_name"
                                placeholder="Acme Corp"
                                value={form.business_name}
                                onChange={handleChange}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="INR">INR - Indian Rupee</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="mt-4 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                Login
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}