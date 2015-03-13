<?php namespace App\Http\Requests;

use App\Http\Requests\Request;

class JSFormRequest extends Request {

	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return false;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'accepted' => 'accepted',
            'active_url' => 'active_url',
            'after' => 'after:"14 May"',
            'alpha' => 'alpha',
            'alpha_dash' => 'alpha_dash',
            'alpha_num' => 'alpha_num',
            'array' => 'array',
            'before' => 'before:"+1 week"',
            'between' => 'between:3,5',
            'boolean' => 'boolean',
            'confirmed' => 'confirmed',
            'date' => 'date',
            'date_format' => 'date_format:d/m/Y',
            'different' => 'different:digits',
            'digits' => 'digits:2',
            'digits_between' => 'digits_between:3,9',
            'email' => 'email',
            'exists' => 'exists:migrations,migration',
            'image' => 'image',
            'in' => 'in:A,B,"CD"',
            'integer' => 'integer',
            'ip' => 'ip',
            'max' => 'max:100',
            'mimes' => 'mimes:png',
            'min' => 'min:5',
            'not_in' => 'not_in:Z,Y,"V V"',
            'numeric' => 'numeric',
            'regex' => 'regex:/\d+/',
            'required' => 'required',
            'required_if' => 'required_if:date_format,17/08/1980',
            'required_with' => 'required_with:before,between',
            'required_with_all' => 'required_with_all:before,between',
            'required_without' => 'required_without:before,between',
            'required_without_all' => 'required_without_all:before,between',
            'same' => 'same:before',
            'size' => 'size:13',
            'size_numeric' => 'size:13|numeric',
            'string' => 'string:value',
            'timezone' => 'timezone',
            'unique' => 'unique:migrations,migration',
            'url' => 'url'
		];

	}

}
