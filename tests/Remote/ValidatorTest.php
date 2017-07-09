<?php

namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Validator as LaravelValidator;
use Proengsoft\JsValidation\Exceptions\BadRequestHttpException;
use Proengsoft\JsValidation\Javascript\ValidatorHandler;
use Proengsoft\JsValidation\Remote\Validator;

class ValidatorTest extends \PHPUnit_Framework_TestCase
{
    public function testValidateRemoteRulePasses()
    {
        $rules = ['field' => 'active_url|required'];
        $data = ['field' => 'http://www.google.com'];
        $params= ['false'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('field',$params);
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
        $params= ['false'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('field',$params);
            $this->fail();
        } catch (\Illuminate\Validation\ValidationException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["field active_url!"]', $ex->getResponse()->getContent());
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["field active_url!"]', $ex->getResponse()->getContent());
        }
    }

    public function testValidateRemoteDisabled()
    {
        $rules = ['field' => 'active_url|required|alpha|no_js_validation'];
        $data = ['field' => 'http://nonexistentdomain'];
        $params= ['false'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('field',$params);
            $this->fail();
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('true', $ex->getResponse()->getContent());
        }
    }

    public function testValidateRemoteAllFields()
    {
        $rules = ['field' => 'required|active_url|alpha'];
        $data = ['field' => 'http://www.google.com'];
        $params= ['true'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('field',$params);
            $this->fail();
        } catch (\Illuminate\Validation\ValidationException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["validation.alpha"]', $ex->getResponse()->getContent());
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["validation.alpha"]', $ex->getResponse()->getContent());
        }
    }

    protected function getRealTranslator()
    {
        $messages = [
            'validation.required' => ':attribute required!',
            'validation.active_url' => ':attribute active_url!'
        ];

        if (method_exists(\Illuminate\Translation\Translator::class,'addLines')) {
            $trans = new \Illuminate\Translation\Translator(
                new \Illuminate\Translation\ArrayLoader, 'en'
            );
            $trans->addLines( $messages, 'en');
        } else {
            $trans = new \Symfony\Component\Translation\Translator('en', new \Symfony\Component\Translation\MessageSelector);
            $trans->addLoader('array', new \Symfony\Component\Translation\Loader\ArrayLoader);
            $trans->addResource('array', $messages , 'en', 'messages' );
        }

        return $trans;
    }

    protected function getRealValidator($rules, $messages = [], $data = [])
    {
        $trans = $this->getRealTranslator();
        $laravelValidator = new LaravelValidator($trans, $data, $rules, $messages );
        $laravelValidator->addExtension(ValidatorHandler::JSVALIDATION_DISABLE, function() {
            return true;
        });
        return new Validator($laravelValidator);
    }
}
