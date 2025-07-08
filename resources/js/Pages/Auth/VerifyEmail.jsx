import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Xác thực Email" />
            
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
                            <EnvelopeIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác thực Email</h1>
                        <p className="text-gray-600">Vui lòng xác thực để tiếp tục</p>
                    </div>

                    {/* Status Message */}
                    {status === 'verification-link-sent' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                            Một liên kết xác thực mới đã được gửi đến địa chỉ email bạn cung cấp khi đăng ký.
                        </div>
                    )}

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="text-sm text-gray-600 mb-6">
                            Cảm ơn bạn đã đăng ký! Vui lòng xác thực địa chỉ email bằng cách nhấp vào liên kết chúng tôi vừa gửi đến hộp thư của bạn. Nếu bạn không nhận được email, chúng tôi sẽ gửi lại một liên kết mới.
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <PrimaryButton
                                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi email...
                                    </div>
                                ) : (
                                    'Gửi lại Email Xác thực'
                                )}
                            </PrimaryButton>
                        </form>

                        {/* Logout Link */}
                        <div className="mt-6 text-center">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
                            >
                                Đăng xuất
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-500">
                            Bằng việc xác thực, bạn đồng ý với{' '}
                            <a href="#" className="text-indigo-600 hover:underline">Điều khoản sử dụng</a>
                            {' '}và{' '}
                            <a href="#" className="text-indigo-600 hover:underline">Chính sách bảo mật</a>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}