<?php

namespace Proengsoft\JsValidation\Tests {
    class  StubFormRequest extends \Illuminate\Foundation\Http\FormRequest {
        public function rules(){return ['name'=>'require'];}
        public function messages(){return [];}
        public function attributes(){return [];}
    }

    class StubFormRequest2 extends \Proengsoft\JsValidation\Remote\FormRequest {
        public function rules(){return ['name'=>'require'];}
        public function messages(){return [];}
        public function attributes(){return [];}
    }
}
