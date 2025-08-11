    import React from 'react';

    const QuotationTemplate = ({ data }) => {
        if (!data) return null;
        return (
            <div className="p-10 bg-white" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif', fontSize: '10pt' }}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">360 Design House Contracting LLC</h1>
                        <p className="text-sm">Al Qouz First, Dubai - United Arab Emirates</p>
                        <p className="text-sm">Phone: +971 50 104 8071</p>
                        <p className="text-sm">Email: sales@mosquitonet.ae</p>
                        <p className="text-sm">Website: www.mosquitonet.ae</p>
                    </div>
                    <h2 className="text-3xl font-bold text-right text-gray-600">Quotation</h2>
                </div>
                <hr className="border-gray-300 mb-8" />
                <div className="flex justify-between mb-8">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Customer Information</h3>
                        <p><strong>Name:</strong> {data.customer_name}</p>
                        <p><strong>Phone:</strong> {data.customer_phone}</p>
                        <p><strong>Address:</strong> {data.customer_address_villa}, {data.customer_address_street}, {data.customer_emirate}</p>
                    </div>
                    <div>
                        <table className="min-w-full">
                            <tbody>
                                <tr>
                                    <td className="font-bold text-right pr-4">Quote ID:</td>
                                    <td className="text-left">{data.quote_id}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-right pr-4">Staff:</td>
                                    <td className="text-left">{data.staff_name}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-right pr-4">Quote Date:</td>
                                    <td className="text-left">{new Date(data.quote_date).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-right pr-4">Expiry Date:</td>
                                    <td className="text-left">{new Date(data.quote_expiry_date).toLocaleDateString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr className="border-gray-300 mb-8" />
                <h3 className="font-bold text-lg mb-2">Line Items</h3>
                <table className="min-w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b">Location</th>
                            <th className="py-2 px-4 border-b">Description</th>
                            <th className="py-2 px-4 border-b">Panel</th>
                            <th className="py-2 px-4 border-b">Color</th>
                            <th className="py-2 px-4 border-b">Dimensions (mm)</th>
                            <th className="py-2 px-4 border-b">Qty</th>
                            <th className="py-2 px-4 border-b text-right">Rate (AED)</th>
                            <th className="py-2 px-4 border-b text-right">Total (AED)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.line_items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{item.location}</td>
                                <td className="py-2 px-4 border-b">{item.description}</td>
                                <td className="py-2 px-4 border-b">{item.panel}</td>
                                <td className="py-2 px-4 border-b">{item.color}</td>
                                <td className="py-2 px-4 border-b">{item.width} x {item.height}</td>
                                <td className="py-2 px-4 border-b">{item.quantity}</td>
                                <td className="py-2 px-4 border-b text-right">{item.rate}</td>
                                <td className="py-2 px-4 border-b text-right">{item.rate * item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end mt-8">
                    <div className="w-full md:w-1/2">
                        <div className="flex justify-between mb-2">
                            <span>Sub Total:</span>
                            <span className="font-bold">AED {data.sub_total}</span>
                        </div>
                        {data.powder_coating_charges > 0 && (
                            <div className="flex justify-between mb-2">
                                <span>Powder Coating:</span>
                                <span className="font-bold">AED {data.powder_coating_charges}</span>
                            </div>
                        )}
                        {data.supply_installation_charge > 0 && (
                            <div className="flex justify-between mb-2">
                                <span>Supply & Installation:</span>
                                <span className="font-bold">AED {data.supply_installation_charge}</span>
                            </div>
                        )}
                        {data.discount_amount > 0 && (
                            <div className="flex justify-between mb-2">
                                <span>Discount:</span>
                                <span className="font-bold">- AED {data.discount_amount}</span>
                            </div>
                        )}
                        <hr className="my-2" />
                        <div className="flex justify-between text-xl font-bold">
                            <span>TOTAL:</span>
                            <span>AED {data.final_total}</span>
                        </div>
                    </div>
                </div>
                {data.notes && (
                    <div className="mt-8">
                        <h3 className="font-bold text-lg mb-2">Notes</h3>
                        <p className="whitespace-pre-wrap">{data.notes}</p>
                    </div>
                )}
            </div>
        );
    };

    export default QuotationTemplate;
    
