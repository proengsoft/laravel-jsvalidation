<?php

namespace Proengsoft\JsValidation\Tests\stubs;

class StubFormRequest2 extends \Proengsoft\JsValidation\Remote\FormRequest {
    public function rules(){return ['name'=>'require'];}
    public function messages(){return [];}
    public function attributes(){return [];}
}
