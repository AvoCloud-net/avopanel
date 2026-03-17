<?php

namespace Everest\Http\Requests\Api\Client\Billing;

class CreateStripePaymentRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'product' => 'required|int|exists:products,id',
            'node_id' => 'nullable|int|exists:nodes,id',
            'server_id' => 'nullable|int|exists:servers,id',
            'variables' => 'nullable|array',
        ];
    }
}
