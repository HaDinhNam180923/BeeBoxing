import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

export default function AddressManager({ className = '' }) {
    const [addresses, setAddresses] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, reset, errors, clearErrors } = useForm({
        receiver_name: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        street_address: '',
        is_default: false
    });

    useEffect(() => {
        fetchAddresses();
        fetchProvinces();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get('/addresses');
            if (response.data.status) {
                setAddresses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };
    
    const fetchProvinces = async () => {
        try {
            const response = await axios.get('/addresses/provinces');
            if (response.data.status) {
                setProvinces(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };
    
    // Tương tự cho các hàm khác, chỉ cần bỏ prefix /api

    const handleProvinceChange = async (province) => {
        setData('province', province);
        setData('district', '');
        setData('ward', '');
        try {
            const response = await axios.get(`/addresses/districts/${province}`);
            if (response.data.status) {
                setDistricts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const handleDistrictChange = async (district) => {
        setData('district', district);
        setData('ward', '');
        try {
            const response = await axios.get(`/addresses/wards/${data.province}/${district}`);
            if (response.data.status) {
                setWards(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('/addresses', data);
            if (response.data.status) {
                await fetchAddresses();
                closeModal();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        }
        setIsLoading(false);
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await axios.put(`/addresses/${addressId}/default`);
            if (response.data.status) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
        try {
            const response = await axios.delete(`/addresses/${addressId}`);
            if (response.data.status) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const closeModal = () => {
        setShowAddressModal(false);
        reset();
        clearErrors();
    };

    return (
        <section className={className}>
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">
                        Địa chỉ giao hàng
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Quản lý danh sách địa chỉ giao hàng của bạn.
                    </p>
                </div>
                <PrimaryButton onClick={() => setShowAddressModal(true)}>
                    Thêm địa chỉ mới
                </PrimaryButton>
            </header>

            <Modal show={showAddressModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Thêm địa chỉ mới
                    </h2>

                    <div className="mt-6 space-y-6">
                        <div>
                            <InputLabel htmlFor="receiver_name" value="Tên người nhận" />
                            <TextInput
                                id="receiver_name"
                                value={data.receiver_name}
                                onChange={(e) => setData('receiver_name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.receiver_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Số điện thoại" />
                            <TextInput
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="province" value="Tỉnh/Thành phố" />
                            <select
                                id="province"
                                value={data.province}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                required
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map((province) => (
                                    <option key={province.province} value={province.province}>
                                        {province.province}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.province} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="district" value="Quận/Huyện" />
                            <select
                                id="district"
                                value={data.district}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                required
                                disabled={!data.province}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map((district) => (
                                    <option key={district.district} value={district.district}>
                                        {district.district}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.district} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="ward" value="Phường/Xã" />
                            <select
                                id="ward"
                                value={data.ward}
                                onChange={(e) => setData('ward', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                required
                                disabled={!data.district}
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.ward} value={ward.ward}>
                                        {ward.ward}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.ward} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="street_address" value="Địa chỉ chi tiết" />
                            <TextInput
                                id="street_address"
                                value={data.street_address}
                                onChange={(e) => setData('street_address', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Số nhà, tên đường..."
                                required
                            />
                            <InputError message={errors.street_address} className="mt-2" />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <label htmlFor="is_default" className="ml-2 text-sm text-gray-600">
                                Đặt làm địa chỉ mặc định
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <SecondaryButton onClick={closeModal}>Hủy</SecondaryButton>
                        <PrimaryButton disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <div className="mt-6 space-y-4">
                {addresses.map((address) => (
                    <div
                        key={address.address_id}
                        className="rounded-lg border p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{address.receiver_name}</span>
                                {address.is_default && (
                                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                        Mặc định
                                    </span>
                                ) || null}
                            </div>
                            <div className="flex gap-4">
                                {!address.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(address.address_id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(address.address_id)}
                                    className="text-sm text-red-600 hover:text-red-900"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            <p>{address.phone}</p>
                            <p>{address.street_address}, {address.ward}, {address.district}, {address.province}</p>
                        </div>
                    </div>
                ))}

            </div>
        </section>
    );
}