import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            { level: 0, text: '', color: '' },
            { level: 1, text: 'Rất yếu', color: 'bg-red-500' },
            { level: 2, text: 'Yếu', color: 'bg-orange-500' },
            { level: 3, text: 'Trung bình', color: 'bg-yellow-500' },
            { level: 4, text: 'Mạnh', color: 'bg-blue-500' },
            { level: 5, text: 'Rất mạnh', color: 'bg-green-500' }
        ];

        return levels[score];
    };

    const passwordStrength = getPasswordStrength(data.password);

    return (
        <GuestLayout>
            <Head title="Đăng ký" />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-lg">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
                        <p className="text-gray-600">Đăng ký để bắt đầu hành trình của bạn</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <InputLabel 
                                    htmlFor="name" 
                                    value="Họ và tên" 
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Nhập họ và tên của bạn"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} className="text-red-500 text-sm" />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <InputLabel 
                                    htmlFor="email" 
                                    value="Email" 
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Nhập email của bạn"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="text-red-500 text-sm" />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <InputLabel 
                                    htmlFor="password" 
                                    value="Mật khẩu" 
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Tạo mật khẩu mạnh"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Password Strength Indicator */}
                                {data.password && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                    style={{width: `${(passwordStrength.level / 5) * 100}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">
                                                {passwordStrength.text}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                                        </div>
                                    </div>
                                )}
                                
                                <InputError message={errors.password} className="text-red-500 text-sm" />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <InputLabel 
                                    htmlFor="password_confirmation" 
                                    value="Xác nhận mật khẩu" 
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <TextInput
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Nhập lại mật khẩu"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Password Match Indicator */}
                                {data.password_confirmation && (
                                    <div className="flex items-center space-x-2">
                                        {data.password === data.password_confirmation ? (
                                            <div className="flex items-center text-green-600 text-sm">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Mật khẩu khớp
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-red-600 text-sm">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Mật khẩu không khớp
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <InputError message={errors.password_confirmation} className="text-red-500 text-sm" />
                            </div>

                            {/* Submit Button */}
                            <PrimaryButton 
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang tạo tài khoản...
                                    </div>
                                ) : (
                                    'Tạo tài khoản'
                                )}
                            </PrimaryButton>
                        </form>

                        {/* Login Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Đã có tài khoản?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-purple-600 hover:text-purple-500 font-semibold transition-colors"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-500">
                            Bằng việc đăng ký, bạn đồng ý với{' '}
                            <a href="#" className="text-purple-600 hover:underline">Điều khoản sử dụng</a>
                            {' '}và{' '}
                            <a href="#" className="text-purple-600 hover:underline">Chính sách bảo mật</a>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}