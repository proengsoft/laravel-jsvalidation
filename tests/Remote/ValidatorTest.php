<?php

namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Validation\Validator as LaravelValidator;
use Proengsoft\JsValidation\Exceptions\BadRequestHttpException;
use Proengsoft\JsValidation\Remote\Validator;

class ValidatorTest extends \PHPUnit_Framework_TestCase
{

    public function testValidateRemoteRulePasses()
    {
        $rules = ['field' => 'active_url|required'];
        $data = ['field' => 'http://www.google.com'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('_jsvalidation','field',[]);
            $this->fail();
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('true', $ex->getResponse()->getContent());
        }

    }

    public function testValidateRemoteRuleFails()
    {
        $rules = ['field' => 'active_url|required'];
        $data = ['field' => 'http://nonexistentdomain'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('_jsvalidation','field',[]);
            $this->fail();
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["field active_url!"]', $ex->getResponse()->getContent());
        }

    }


    public function testValidateRemoteBadAttribute()
    {
        $rules = ['field' => 'active_url|required'];
        $data = ['field' => 'http://nonexistentdomain'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('_jsvalidation','undefined',[]);
            $this->fail();
        } catch (BadRequestHttpException $ex) {
            $this->assertEquals("Undefined 'undefined' attribute", $ex->getMessage());
        }

    }

    public function testValidateRemoteBadRules()
    {
        $rules = ['field' => 'required'];
        $data = ['field' => 'http://www.google.es'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('_jsvalidation','field',[]);
            $this->fail();
        } catch (BadRequestHttpException $ex) {
            $this->assertEquals("No validations available for 'field'", $ex->getMessage());
        }

    }


    protected function getRealTranslator()
    {
        $trans = new \Symfony\Component\Translation\Translator('en', new \Symfony\Component\Translation\MessageSelector);
        $trans->addLoader('array', new \Symfony\Component\Translation\Loader\ArrayLoader);
        $trans->addResource(
            'array',
            [
                'validation.required' => ':attribute required!',
                'validation.active_url' => ':attribute active_url!'
            ],
            'en',
            'messages'
        );

        return $trans;
    }

    protected function getRealValidator($rules, $messages = array(), $data=[])
    {
        $trans = $this->getRealTranslator();
        $laravelValidator = new LaravelValidator($trans, $data, $rules, $messages );
        return new Validator($laravelValidator);
    }

}
