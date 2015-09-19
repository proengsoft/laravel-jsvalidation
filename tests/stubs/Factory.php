<?php


namespace  Illuminate\Foundation\Http {
    if (!class_exists('FormRequest')) {

        class  FormRequest {
            public function initialize(){}
            public function setSession(){}
            public function setUserResolver(){}
            public function setRouteResolver() {}
        }
    }

}


namespace Proengsoft\JsValidation\Test {
    use Closure;

    class  FakeFormRequest extends \Illuminate\Foundation\Http\FormRequest {
        public function rules(){return ['name'=>'require'];}
        public function messages(){return [];}
        public function attributes(){return [];}
    }

}