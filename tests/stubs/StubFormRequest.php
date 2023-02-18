<?php

namespace Proengsoft\JsValidation\Tests\stubs;

class StubFormRequest extends \Illuminate\Foundation\Http\FormRequest
{
    public function rules(){return ['name'=>'require'];}
    public function messages(){return [];}
    public function attributes(){return [];}
}
