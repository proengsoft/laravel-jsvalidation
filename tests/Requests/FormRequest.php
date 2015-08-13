<?php

namespace Proengsoft\JsValidation\Test\Requests;

use Illuminate\Foundation\Http\FormRequest as BaseRequest;

class FormRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'accepted'             => 'accepted',
            'active_url'           => 'active_url',
            'after'                => 'after:"14 May"',
            'after_format'         => 'after:"14 May"|date_format:Y-m-d',
            'alpha'                => 'alpha',
            'alpha_dash'           => 'alpha_dash',
            'alpha_num'            => 'alpha_num',
            'array'                => 'array',
            'before'               => 'before:"+2 week"',
            'before_format'        => 'before:"+2 week"|date_format:d/m/Y',
            'between'              => 'between:3,5',
            'boolean'              => 'boolean',
            'confirmed'            => 'confirmed',
            'date'                 => 'date',
            'date_format'          => 'date_format:d/m/Y',
            'different'            => 'different:digits',
            'digits'               => 'digits:2',
            'digits_between'       => 'digits_between:3,9',
            'email'                => 'email',
            'exists'               => 'exists:migrations,migration',
            'image'                => 'image',
            'in'                   => 'in:A,B,"CD"',
            'integer'              => 'integer',
            'ip'                   => 'ip',
            'max'                  => 'max:100',
            'mimes'                => 'mimes:png',
            'min'                  => 'min:5',
            'not_in'               => 'not_in:Z,Y,"V V"',
            'numeric'              => 'numeric',
            'regex'                => 'regex:/[a-z]+/',
            'required'             => 'required',
            'required_if'          => 'required_if:alpha,aaaa',
            'required_with'        => 'required_with:before,between',
            'required_with_all'    => 'required_with_all:before,between',
            'required_without'     => 'required_without:before,between',
            'required_without_all' => 'required_without_all:before,between',
            'same'                 => 'same:before',
            'size'                 => 'size:13',
            'size_numeric'         => 'size:13|numeric',
            'string'               => 'string:value',
            'timezone'             => 'timezone',
            'unique'               => 'unique:migrations,migration',
            'url'                  => 'url',
        ];
    }

    public function messages()
    {
        return [];
    }
}
