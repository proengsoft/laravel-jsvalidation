<?php

namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Translation\ArrayLoader;
use Illuminate\Translation\Translator;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator as LaravelValidator;
use PHPUnit_Framework_TestCase;
use Proengsoft\JsValidation\Javascript\ValidatorHandler;
use Proengsoft\JsValidation\Remote\Validator;
use Symfony\Component\Translation\Loader\ArrayLoader as SymfonyArrayLoader;
use Symfony\Component\Translation\MessageSelector;
use Symfony\Component\Translation\Translator as SymfonyTranslator;

class ValidatorTest extends PHPUnit_Framework_TestCase
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
        } catch (ValidationException $ex) {
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
        } catch (ValidationException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["validation.alpha"]', $ex->getResponse()->getContent());
        } catch (HttpResponseException $ex) {
            $this->assertEquals(200, $ex->getResponse()->getStatusCode());
            $this->assertEquals('["validation.alpha"]', $ex->getResponse()->getContent());
        }
    }

    /**
     * @dataProvider ruleProvider
     */
    public function testPurgeNonRemoteRules($rule, $value, $passes)
    {
        $rules = ['field' => $rule];
        $data = ['field' => $value];

        $trans = $this->getRealTranslator();
        $laravelValidator = new LaravelValidator($trans, $data, $rules);
        $this->assertSame($passes, $laravelValidator->passes());

        $validator = $this->getMockBuilder(Validator::class)
            ->setConstructorArgs([$laravelValidator])
            ->setMethods(['throwValidationException', 'isRemoteRule'])
            ->getMock();

        $validator
            ->expects($this->any())
            ->method('isRemoteRule')
            ->will($this->returnValue(true));

        $validator
            ->expects($this->once())
            ->method('throwValidationException')
            ->with($passes ? true : $this->isType('array'), $laravelValidator);

        $validator->validate('field', ['validate_all' => ['true']]);
    }

    public function ruleProvider()
    {
        return [
            'string_rule_pass' => [
                'required',
                'foo',
                true,
            ],
            'string_rule_fail' => [
                'required',
                '',
                false,
            ],
            'array_rule_pass' => [
                ['required', ['in', 'foo']],
                'foo',
                true,
            ],
            'array_rule_fail' => [
                ['required', ['in', 'foo']],
                'bar',
                false,
            ],
        ];
    }

    protected function getRealTranslator()
    {
        $messages = [
            'validation.required' => ':attribute required!',
            'validation.active_url' => ':attribute active_url!'
        ];

        if (method_exists(Translator::class,'addLines')) {
            $trans = new Translator(
                new ArrayLoader(), 'en'
            );
            $trans->addLines( $messages, 'en');
        } else {
            $trans = new SymfonyTranslator('en', new MessageSelector());
            $trans->addLoader('array', new SymfonyArrayLoader());
            $trans->addResource('array', $messages , 'en', 'messages' );
        }

        return $trans;
    }

    protected function getRealValidator($rules, $messages = [], $data = [])
    {
        $trans = $this->getRealTranslator();
        $laravelValidator = new LaravelValidator($trans, $data, $rules, $messages);
        $laravelValidator->addExtension(ValidatorHandler::JSVALIDATION_DISABLE, function() {
            return true;
        });
        return new Validator($laravelValidator);
    }
}
