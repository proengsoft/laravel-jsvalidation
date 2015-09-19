<?php namespace Proengsoft\JsValidation\Test;

use Illuminate\Http\Exception\HttpResponseException;
use Mockery as m;
use Proengsoft\JsValidation\DelegatedValidator;
use Proengsoft\JsValidation\Validator;
use Illuminate\Validation\Validator as LaravelValidator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class DelegatedValidatorTest extends \PHPUnit_Framework_TestCase {


    public function tearDown(){
        m::close();
    }

    public function testGetValidator()
    {
        $trans = new \Symfony\Component\Translation\Translator('en', new \Symfony\Component\Translation\MessageSelector);
        $validator = new LaravelValidator($trans,[],[]);
        $delegated = new DelegatedValidator($validator );
        $this->assertEquals($validator, $delegated->getValidator());

    }


}
