<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class MagpieService
{
    public function __construct()
    {
        // Using direct HTTP requests to bypass SDK ValidationException bug
    }

    /**
     * Create a checkout session with Magpie
     */
    public function createCheckoutSession(array $data): array
    {
        try {
            $payload = $this->buildCheckoutPayload($data);

            Log::info('Creating Magpie checkout session', ['payload' => $payload]);

            // Use direct HTTP request to bypass SDK bug
            $response = $this->makeDirectRequest($payload);

            Log::info('Magpie checkout session created successfully', [
                'session_id' => $response['id'] ?? 'unknown',
                'payment_url' => $response['payment_url'] ?? 'missing',
            ]);

            return $response;

        } catch (Exception $e) {
            Log::error('Magpie checkout session error', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Make direct HTTP request to Magpie checkout URL
     */
    private function makeDirectRequest(array $payload): array
    {
        $checkoutUrl = env('MAGPIE_CHECKOUT_URL');

        Log::info('Making direct request to Magpie', [
            'url' => $checkoutUrl,
            'payload' => $payload,
        ]);

        $client = new \GuzzleHttp\Client([
            'timeout' => 30,
        ]);

        $response = $client->post($checkoutUrl, [
            'json' => $payload,
            'headers' => [
                'Authorization' => 'Basic '.base64_encode(env('MAGPIE_SECRET_KEY').':'),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    /**
     * Build the checkout payload for Magpie
     */
    private function buildCheckoutPayload(array $data): array
    {
        $payload = [
            'cancel_url' => $data['cancel_url'],
            'success_url' => $data['success_url'],
            'currency' => 'php', // Required field based on Packagist docs
            'payment_method_types' => ['card', 'qrph', 'paymaya'],
        ];

        // Add line items with correct structure for Magpie
        if (isset($data['line_items'])) {
            $payload['line_items'] = array_map(function ($item) {
                return [
                    'name' => $item['description'],
                    'amount' => $this->formatAmount($item['amount']), // Convert to centavos
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'image' => null, // Optional image field
                ];
            }, $data['line_items']);
        }

        // Add optional fields if provided
        if (isset($data['customer_email'])) {
            $payload['customer_email'] = $data['customer_email'];
        }

        return $payload;
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Convert amount to centavos for Magpie
     */
    public function formatAmount(float|string $amount): int
    {
        return (int) ((float) $amount * 100);
    }

    /**
     * Convert centavos from Magpie to amount
     */
    public function formatCurrency(int $centavos): float
    {
        return $centavos / 100;
    }
}
