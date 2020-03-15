<?php
namespace Proengsoft\JsValidation\Tests\Remote;

class UrlIsLaravel implements \Illuminate\Contracts\Validation\Rule
{
    public function passes($attribute, $value)
    {
        return $value === 'https://www.laravel.com';
    }

    public function message()
    {
        return 'The :attribute is not https://www.laravel.com';
    }
}