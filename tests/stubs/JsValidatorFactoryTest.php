<?php

namespace  Illuminate\Foundation\Http {
    if (!class_exists('FormRequest')) {
        class  FormRequest {
            public function initialize(){}
            public function setLaravelSession(){}
            public function setUserResolver(){}
            public function setRouteResolver() {}
            public function setContainer() {}
        }
    }
}

namespace Proengsoft\JsValidation\Tests {
    use Mockery as m;
    class  StubFormRequest extends \Illuminate\Foundation\Http\FormRequest {
        public function rules(){return ['name'=>'require'];}
        public function messages(){return [];}
        public function attributes(){return [];}

        public static function createFromBase() {
            //$sessionMock =  m::mock('Symfony\Component\HttpFoundation\Session\SessionInterface',[]);
            $mockedRequest = m::mock(\Symfony\Component\HttpFoundation\Request::class);
            $mockedRequest->shouldReceive('setSession')
                ->shouldReceive('setUserResolver')
                ->shouldReceive('setRouteResolver')
                ->shouldReceive('messages')->andReturn([])
                ->shouldReceive('attributes')->andReturn([]);
            return $mockedRequest;
        }
    }
}
