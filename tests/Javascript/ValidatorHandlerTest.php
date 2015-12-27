<?php

namespace Proengsoft\JsValidation\Javascript;


class ValidatorHandlerTest extends \PHPUnit_Framework_TestCase
{

    public function testValidationData() {

        $attribute = 'field';
        $rule = 'required_if:field2,value2';

        $rules = ['field'=>['required','array']];

        $mockDelegated = $this->getMockBuilder('Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->setMethods(['getRules','hasRule','parseRule','getRule','isImplicit'])
            ->getMock();

        $mockDelegated->expects($this->any())
            ->method('getRules')
            ->willReturn([$attribute=>[$rule]]);

        $mockDelegated->expects($this->any())
            ->method('hasRule')
            ->with($attribute, ValidatorHandler::JSVALIDATION_DISABLE)
            ->willReturn(false);

        $mockDelegated->expects($this->once())
            ->method('parseRule')
            ->with($rule)
            ->willReturn(['RequiredIf',['field2','value2']]);

        $mockDelegated->expects($this->once())
            ->method('isImplicit')
            ->with('RequiredIf')
            ->willReturn(false);


        $mockRule = $this->getMock('Proengsoft\JsValidation\Javascript\RuleParser',[], [$mockDelegated] );
        $mockRule->expects($this->once())
            ->method('getRule')
            ->with($attribute, 'RequiredIf', ['field2','value2'])
            ->willReturn([$attribute, RuleParser::JAVASCRIPT_RULE, ['field2','value2']]);

        $mockMessages = $this->getMock('Proengsoft\JsValidation\Javascript\MessageParser', [], [$mockDelegated] );
        $mockMessages->expects($this->once())
            ->method('getMessage')
            ->with($attribute, 'RequiredIf', ['field2','value2'])
            ->willReturn('Field is required if');


        $handler = new ValidatorHandler($mockRule, $mockMessages);
        $handler->setDelegatedValidator($mockDelegated);

        $data = $handler->validationData();
        $expected = [
            'rules' => array('field'=>['laravelValidation'=>[['RequiredIf',['field2','value2'],'Field is required if',false]]]),
            'messages' =>  array(),
        ];

        $this->assertEquals($expected, $data);


    }


    public function testValidationDataDisabled() {

        $attribute = 'field';
        $rule = 'required_if:field2,value2|no_js_validation';

        $rules = ['field'=>['required','array']];

        $mockDelegated = $this->getMockBuilder('Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->setMethods(['getRules','hasRule','parseRule','getRule','isImplicit'])
            ->getMock();

        $mockDelegated->expects($this->any())
            ->method('getRules')
            ->willReturn([$attribute=>explode('|',$rule)]);

        $mockDelegated->expects($this->any())
            ->method('hasRule')
            ->with($attribute, ValidatorHandler::JSVALIDATION_DISABLE)
            ->willReturn(true);

        $mockRule = $this->getMock('Proengsoft\JsValidation\Javascript\RuleParser',[], [$mockDelegated] );

        $mockMessages = $this->getMock('Proengsoft\JsValidation\Javascript\MessageParser', [], [$mockDelegated] );


        $handler = new ValidatorHandler($mockRule, $mockMessages);
        $handler->setDelegatedValidator($mockDelegated);

        $data = $handler->validationData();
        $expected = [
            'rules' => array(),
            'messages' =>  array(),
        ];

        $this->assertEquals($expected, $data);


    }


}
