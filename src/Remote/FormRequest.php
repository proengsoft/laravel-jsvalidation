<?php

namespace Proengsoft\JsValidation\Remote;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest as Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class FormRequest extends Request
{
    /**
     * Field to identify requests originating from this library.
     */
    const JS_VALIDATION_FIELD = '__proengsoft_form_request';

    /**
     * Handle a passed validation attempt.
     *
     * @return void
     */
    protected function passedValidation()
    {
        if ($this->isJsValidation()) {
            throw new HttpResponseException(
                new JsonResponse(true, 200)
            );
        }

        parent::passedValidation();
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(Validator $validator)
    {
        if ($this->isJsValidation()) {
            throw new ValidationException(
                $validator,
                new JsonResponse($validator->errors()->messages(), 200)
            );
        }

        parent::failedValidation($validator);
    }

    /**
     * Whether the request originated from laravel-jsvalidation.
     *
     * @return bool
     */
    private function isJsValidation()
    {
        return $this->has(static::JS_VALIDATION_FIELD);
    }
}
