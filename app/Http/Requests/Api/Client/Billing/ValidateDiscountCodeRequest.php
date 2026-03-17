<?php

namespace Everest\Http\Requests\Api\Client\Billing;

class ValidateDiscountCodeRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'code' => 'required|string|min:4|max:16',
        ];
    }
}
