    'use client';

    import { useState } from 'react';
    import { useRouter } from 'next/navigation';
    import { FaUserShield } from 'react-icons/fa';

    export default function LoginPage() {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const router = useRouter();

        const handleLogin = (e) => {
            e.preventDefault();
            setError('');

            if (username === 'mosquitonet.ae' && password === '8086') {
                document.cookie = "isAuthenticated=true; path=/";
                router.push('/dashboard');
            } else {
                setError('Invalid username or pincode.');
            }
        };

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                    <div className="flex flex-col items-center">
                        <FaUserShield size={48} className="text-indigo-600 mb-4" />
                        <h1 className="text-3xl font-bold text-center text-gray-900">Staff Login</h1>
                        <p className="text-gray-500 text-sm mt-1">Mosquitonet.ae Portal</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <p className="text-red-500 text-center font-medium">{error}</p>}
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Pincode</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
