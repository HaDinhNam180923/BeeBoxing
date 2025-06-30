import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const OrderReturnActions = ({ order, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [action, setAction] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const openModal = (actionType) => {
        setAction(actionType);
        setAdminNote('');
        setError(null);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setAction('');
        setAdminNote('');
        setError(null);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            let response;
            if (action === 'COMPLETE') {
                response = await axios.post(`/api/admin/orders/${order.order_id}/return/complete`, {
                    admin_note: adminNote
                }, { withCredentials: true });
            } else {
                response = await axios.put(`/api/admin/orders/${order.order_id}/return`, {
                    return_status: action,
                    admin_note: adminNote
                }, { withCredentials: true });
            }

            if (response.data.status) {
                onUpdate(response.data.data);
                closeModal();
            } else {
                setError(response.data.message || 'Lỗi khi thực hiện hành động');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thực hiện hành động');
        } finally {
            setLoading(false);
        }
    };

    if (!order.return_status) {
        return null;
    }

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động trả hàng</h3>
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <div className="flex space-x-2">
                    {order.return_status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => openModal('APPROVED')}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150"
                            >
                                Duyệt
                            </button>
                            <button
                                onClick={() => openModal('REJECTED')}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150"
                            >
                                Từ chối
                            </button>
                        </>
                    )}
                    {order.return_status === 'APPROVED' && (
                        <button
                            onClick={() => openModal('COMPLETE')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150"
                        >
                            Hoàn tất
                        </button>
                    )}
                </div>

                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={closeModal}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            {action === 'APPROVED' ? 'Duyệt yêu cầu trả hàng' :
                                             action === 'REJECTED' ? 'Từ chối yêu cầu trả hàng' :
                                             'Hoàn tất trả hàng'}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Vui lòng nhập ghi chú (tùy chọn) cho hành động này.
                                            </p>
                                            <textarea
                                                className="mt-2 w-full border-gray-300 rounded-md shadow-sm"
                                                rows="4"
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                                placeholder="Nhập ghi chú..."
                                            />
                                        </div>

                                        <div className="mt-4 flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                onClick={closeModal}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                                onClick={handleSubmit}
                                                disabled={loading}
                                            >
                                                {loading ? 'Đang xử lý...' : 'Xác nhận'}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default OrderReturnActions;