<?php

namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Http\Exception\HttpResponseException;
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

    public function testValidateRemoteDisabled() {
        $rules = ['field' => 'active_url|required|alpha|no_js_validation'];
        $data = ['field' => 'http://nonexistentdomain'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->validate('_jsvalidation','field',[]);
            $this->fail();
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('true', $ex->getResponse()->getContent());
        }
    }

    public function testValidateRemoteAllFields() {
        $rules = ['field' => 'required|active_url|alpha'];
        $data = ['field' => 'http://www.google.com'];
        $validator = $this->getRealValidator($rules, [],$data);

        try {
            $validator->setValidateAll(true);
            $validator->validate('_jsvalidation','field',[]);
            $this->fail();
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["validation.alpha"]', $ex->getResponse()->getContent());
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
        $laravelValidator->addExtension(ValidatorHandler::JSVALIDATION_DISABLE, function() {
            return true;
        });
        return new Validator($laravelValidator);
    }

}
