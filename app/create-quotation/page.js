    'use client';

    import { useState, useEffect, useRef } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { MdAddCircle, MdContentCopy, MdDelete } from 'react-icons/md';
    import DatePicker from 'react-datepicker';
    import 'react-datepicker/dist/react-datepicker.css';
    import html2canvas from 'html2canvas';
    import jsPDF from 'jspdf';
    import QuotationTemplate from '@/components/QuotationTemplate';
    import { useRouter } from 'next/navigation';

    const initialLineItem = {
        location: '',
        description: 'Fiberglass polyester Mosquito Nets',
        panel: 'Single',
        color: 'White',
        width: 0,
        height: 0,
        quantity: 1,
        rate: 0,
    };

    const staffNames = ['Prashanth', 'Gayaz', 'Jibin', 'Shine', 'Niveth N R'];
    const emirateCharges = {
        'Sharjah': 150,
        'Ajman': 100,
        'Abu Dhabi': 300,
        'Ras Al Khaimah': 250,
        'Dubai': 200,
    };

    const calculateRate = (L, M) => {
        if (L <= 0 || M <= 0) return 0;
        const result = ((((L * 2) + (M * 2)) * 2.25) + (M * 2 * 1.5) + (M * 2.5) + ((((L * 2) + (M * 2)) * 2.25) * 0.5) + (M * 2 * 0.75) + (M * 2 * 0.75) + (M * 0.75) + (M * 0.5) + (M * 2 * 0.5) + (L * M * 1.8 * 6) + 9) * 3.65 * 2;
        return Math.ceil(result / 5) * 5;
    };

    const defaultFormData = {
        staff_name: '',
        quote_date: new Date(),
        quote_expiry_date: new Date(new Date().setDate(new Date().getDate() + 10)),
        customer_name: '',
        customer_phone: '',
        customer_address_villa: '',
        customer_address_street: '',
        customer_emirate: '',
        supply_installation_charge: 0,
        powder_coating_charges: 0,
        discount_amount: 0,
        discount_percentage: 0,
        sub_total: 0,
        final_total: 0,
        notes: '',
        line_items: [initialLineItem],
    };

    export default function CreateQuotation() {
        const [formData, setFormData] = useState(defaultFormData);
        const [loading, setLoading] = useState(false);
        const pdfTemplateRef = useRef(null);
        const router = useRouter();

        useEffect(() => {
            const totalLineItems = formData.line_items.reduce((acc, item) => acc + (item.rate * item.quantity), 0);
            const subTotal = totalLineItems + formData.supply_installation_charge + (formData.powder_coating_charges || 0);
            
            let discountValue = 0;
            if (formData.discount_percentage > 0) {
                discountValue = (subTotal * formData.discount_percentage) / 100;
            } else {
                discountValue = formData.discount_amount;
            }

            const finalTotal = subTotal - discountValue;

            setFormData(prev => ({
                ...prev,
                sub_total: Math.round(subTotal),
                final_total: Math.round(finalTotal),
            }));
        }, [formData.line_items, formData.supply_installation_charge, formData.powder_coating_charges, formData.discount_amount, formData.discount_percentage]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleDateChange = (date) => {
            const expiryDate = new Date(date);
            expiryDate.setDate(expiryDate.getDate() + 10);
            setFormData(prev => ({
                ...prev,
                quote_date: date,
                quote_expiry_date: expiryDate,
            }));
        };

        const handleEmirateChange = (e) => {
            const emirate = e.target.value;
            const charge = emirateCharges[emirate] || 0;
            setFormData(prev => ({
                ...prev,
                customer_emirate: emirate,
                supply_installation_charge: charge,
            }));
        };

        const handleLineItemChange = (index, e) => {
            const { name, value } = e.target;
            const newList = [...formData.line_items];
            newList[index][name] = name === 'width' || name === 'height' || name === 'quantity' ? parseFloat(value) : value;

            if (name === 'width' || name === 'height') {
                const width = name === 'width' ? parseFloat(value) : newList[index].width;
                const height = name === 'height' ? parseFloat(value) : newList[index].height;
                newList[index].rate = calculateRate(width, height);
            }

            setFormData(prev => ({ ...prev, line_items: newList }));
        };

        const addLineItem = () => {
            setFormData(prev => ({
                ...prev,
                line_items: [...prev.line_items, initialLineItem],
            }));
        };

        const cloneLineItem = (index) => {
            const itemToClone = formData.line_items[index];
            setFormData(prev => ({
                ...prev,
                line_items: [...prev.line_items, { ...itemToClone }],
            }));
        };

        const deleteLineItem = (index) => {
            const newList = formData.line_items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, line_items: newList }));
        };

        const generateQuoteId = () => {
            if (!formData.staff_name) return `QT-UN${Math.floor(1000 + Math.random() * 9000)}`;
            const staffInitials = formData.staff_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            return `QT-${staffInitials}${randomDigits}`;
        };

        const handleSave = async (status) => {
            setLoading(true);
            const quoteId = generateQuoteId();
            
            const { error } = await supabase
                .from('quotations')
                .insert([{
                    ...formData,
                    quote_id: quoteId,
                    status: status,
                    quote_date: formData.quote_date.toISOString().split('T')[0],
                    quote_expiry_date: formData.quote_expiry_date.toISOString().split('T')[0],
                    line_items: formData.line_items,
                }]);

            if (error) {
                console.error('Error saving quotation:', error);
                alert('An error occurred while saving the quotation.');
            } else {
                alert(`Quotation saved as ${status} successfully!`);
                if (status !== 'Draft') {
                    const pdfContainer = pdfTemplateRef.current;
                    if (pdfContainer) {
                        const canvas = await html2canvas(pdfContainer, { scale: 2 });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const imgProps = pdf.getImageProperties(imgData);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`${quoteId}.pdf`);
                    }
                }
                setFormData(defaultFormData);
                router.push('/dashboard');
            }
            setLoading(false);
        };

        return (
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Quotation</h1>

                <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">1. Staff & Quote Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Staff Name</label>
                            <select
                                name="staff_name"
                                value={formData.staff_name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                            >
                                <option value="">Select Staff</option>
                                {staffNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Quote Date</label>
                            <DatePicker
                                selected={formData.quote_date}
                                onChange={handleDateChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Quote Expiry Date</label>
                            <DatePicker
                                selected={formData.quote_expiry_date}
                                onChange={() => {}}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-gray-100 cursor-not-allowed"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">2. Customer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Customer Name</label>
                            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Phone Number (+971)</label>
                            <input type="text" name="customer_phone" value={formData.customer_phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Villa/Apartment No.</label>
                            <input type="text" name="customer_address_villa" value={formData.customer_address_villa} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Street Address</label>
                            <input type="text" name="customer_address_street" value={formData.customer_address_street} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Choose Emirate</label>
                            <select name="customer_emirate" value={formData.customer_emirate} onChange={handleEmirateChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2">
                                <option value="">Select Emirate</option>
                                {Object.keys(emirateCharges).map(emirate => <option key={emirate} value={emirate}>{emirate}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">3. Line Items</h2>
                    {formData.line_items.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center mb-4 border-b pb-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" name="location" value={item.location} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <select name="description" value={item.description} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2">
                                    <option value="Fiberglass polyester Mosquito Nets">Fiberglass polyester Mosquito Nets</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Panel</label>
                                <select name="panel" value={item.panel} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2">
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Color</label>
                                <select name="color" value={item.color} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2">
                                    <option value="White">White</option>
                                    <option value="Black">Black</option>
                                    <option value="Custom">Custom</option>
                                </select>
                                {item.color === 'Custom' && (
                                    <input type="text" placeholder="Enter custom color" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                                )}
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Width (mm)</label>
                                <input type="number" name="width" value={item.width} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Height (mm)</label>
                                <input type="number" name="height" value={item.height} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Qty</label>
                                <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleLineItemChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Rate</label>
                                <input type="text" value={item.rate} readOnly className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-gray-100" />
                            </div>
                            <div className="md:col-span-1 flex items-end space-x-2">
                                <button type="button" onClick={() => cloneLineItem(index)} className="text-gray-500 hover:text-indigo-600"><MdContentCopy size={20} /></button>
                                {formData.line_items.length > 1 && (
                                    <button type="button" onClick={() => deleteLineItem(index)} className="text-red-500 hover:text-red-700"><MdDelete size={20} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addLineItem} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        <MdAddCircle size={20} className="mr-2" /> Add Line Item
                    </button>

                    <div className="mt-6 border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700">Powder Coating Charges</label>
                            <select name="powder_coating_charges" value={formData.powder_coating_charges} onChange={handleChange} className="block w-1/2 md:w-1/4 border border-gray-300 rounded-lg shadow-sm p-2">
                                <option value="0">AED 0</option>
                                {Array.from({ length: 12 }, (_, i) => 300 + i * 200).map(charge => (
                                    <option key={charge} value={charge}>AED {charge}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-gray-700">Supply & Installation Charges</span>
                            <span className="font-bold">AED {formData.supply_installation_charge}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-lg mb-4 border-t pt-4">
                            <span>Sub Total</span>
                            <span>AED {formData.sub_total}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700">Discount</label>
                            <input type="number" name="discount_amount" value={formData.discount_amount} onChange={handleChange} className="block w-1/2 md:w-1/4 border border-gray-300 rounded-lg shadow-sm p-2" placeholder="Amount" />
                            <span className="mx-2 text-gray-500">or</span>
                            <input type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleChange} className="block w-1/2 md:w-1/4 border border-gray-300 rounded-lg shadow-sm p-2" placeholder="Percentage (%)" />
                        </div>
                        <div className="flex items-center justify-between font-bold text-2xl mt-4 border-t pt-4">
                            <span>TOTAL</span>
                            <span>AED {formData.final_total}</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-700">Notes / Terms and Conditions</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => handleSave('Draft')}
                        className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={() => handleSave('Completed')}
                        className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition duration-150 ease-in-out"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Save & Download Quotation'}
                    </button>
                </div>
                
                <div ref={pdfTemplateRef} style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                    <QuotationTemplate data={formData} />
                </div>
            </div>
        );
    }
    
