<?php
return [
    'tmn_code' => env('VNPAY_TMN_CODE', 'OQDC2OOI'),
    'hash_secret' => env('VNPAY_HASH_SECRET', 'RPWR2HED1DADEBZIUT6S0ACUW9HDDY9A'),
    'url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'return_url' => env('VNPAY_RETURN_URL', 'http://localhost:8000/payment/vnpay/return'),
    'api_url' => env('VNPAY_API_URL', 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'),
];
