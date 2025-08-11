    'use client';

    import { useState, useEffect } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import Link from 'next/link';
    import { FaPlus, FaTachometerAlt } from 'react-icons/fa';

    export default function Dashboard() {
        const [quotations, setQuotations] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchQuotations = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('quotations')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) {
                    console.error('Error fetching quotations:', error);
                } else {
                    setQuotations(data);
                }
                setLoading(false);
            };
            
            fetchQuotations();

            const subscription = supabase
                .channel('public:quotations')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, payload => {
                    fetchQuotations();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }, []);

        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <Link href="/create-quotation" className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 flex items-center space-x-2 transition duration-150 ease-in-out">
                        <FaPlus /> <span>Create New Quotation</span>
                    </Link>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500 text-xl py-10">Loading quotations...</p>
                ) : (
                    <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emirate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {quotations.map(quote => (
                                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.quote_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.staff_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.customer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.customer_emirate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">AED {quote.final_total}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                quote.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }
    
