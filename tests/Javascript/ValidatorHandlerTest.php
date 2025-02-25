<?php

namespace Proengsoft\JsValidation\Tests\Javascript;

use Mockery;
use Proengsoft\JsValidation\Javascript\MessageParser;
use Proengsoft\JsValidation\Support\DelegatedValidator;
use Proengsoft\JsValidation\Tests\TestCase;
use Proengsoft\JsValidation\Javascript\RuleParser;
use Proengsoft\JsValidation\Javascript\ValidatorHandler;

class ValidatorHandlerTest extends TestCase
{
    public function testValidationData()
    {

        $attribute = 'field';
        $rule = 'required_if:field2,value2';

        $mockDelegated = Mockery::mock(DelegatedValidator::class)->makePartial();
        $mockDelegated->shouldReceive('getRules')->andReturn([$attribute=>[$rule]]);
        $mockDelegated->shouldReceive('hasRule')->with($attribute, ValidatorHandler::JSVALIDATION_DISABLE)->andReturn(false);
        $mockDelegated->shouldReceive('parseRule')->with($rule)->andReturn(['RequiredIf',['field2','value2']]);
        $mockDelegated->shouldReceive('isImplicit')->with('RequiredIf')->andReturn(false);

        $mockRule = $this->getMockBuilder(RuleParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $mockRule->expects($this->once())
            ->method('getRule')
            ->with($attribute, 'RequiredIf', ['field2','value2'])
            ->willReturn([$attribute, RuleParser::JAVASCRIPT_RULE, ['field2','value2']]);

        $mockMessages = $this->getMockBuilder('Proengsoft\JsValidation\Javascript\MessageParser')
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $mockMessages->expects($this->once())
            ->method('getMessage')
            ->with($attribute, 'RequiredIf', ['field2','value2'])
            ->willReturn('Field is required if');


        $handler = new ValidatorHandler($mockRule, $mockMessages);
        $handler->setDelegatedValidator($mockDelegated);

        $data = $handler->validationData();
        $expected = [
            'rules' => [
                'field' => [
                    'laravelValidation' => [
                        [
                            'RequiredIf',
                            ['field2', 'value2'],
                            'Field is required if',
                            false,
                            'field',
                        ]
                    ]
                ]
            ],
            'messages' =>  [],
        ];

        $this->assertEquals($expected, $data);
    }

    public function testValidationDataDisabled()
    {
        $attribute = 'field';
        $rule = 'required_if:field2,value2|no_js_validation';

        $mockDelegated = Mockery::mock(DelegatedValidator::class)->makePartial();
        $mockDelegated->shouldReceive('getRules')->andReturn([$attribute=>explode('|',$rule)]);
        $mockDelegated->shouldReceive('hasRule')->with($attribute, ValidatorHandler::JSVALIDATION_DISABLE)->andReturn(true);

        $mockRule = $this->getMockBuilder(RuleParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $mockMessages = $this->getMockBuilder(MessageParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $handler = new ValidatorHandler($mockRule, $mockMessages);
        $handler->setDelegatedValidator($mockDelegated);

        $data = $handler->validationData();
        $expected = [
            'rules' => [],
            'messages' => [],
        ];

        $this->assertEquals($expected, $data);
    }

    public function testSometimes()
    {
        $attribute = 'field';
        $rule = 'required_if:field2,value2';

        $mockDelegated = Mockery::mock(DelegatedValidator::class)->makePartial();
        $mockDelegated->shouldReceive('sometimes')->andReturn(null);
        $mockDelegated->shouldReceive('getRules')->andReturn([$attribute=>[$rule]]);
        $mockDelegated->shouldReceive('hasRule')->with($attribute, ValidatorHandler::JSVALIDATION_DISABLE)->andReturn(false);
        $mockDelegated->shouldReceive('parseRule')->with($rule)->andReturn(['RequiredIf',['field2','value2']]);
        $mockDelegated->shouldReceive('isImplicit')->with('RequiredIf')->andReturn(false);

        $mockRule = $this->getMockBuilder(RuleParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $mockRule->expects($this->once())
            ->method('getRule')
            ->with($attribute, 'RequiredIf', ['field2','value2'])
            ->willReturn([$attribute, RuleParser::REMOTE_RULE, ['field2','value2']]);

        $mockMessages = $this->getMockBuilder(MessageParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $mockMessages->expects($this->once())
            ->method('getMessage')
            ->with($attribute, 'RequiredIf', ['field2','value2'])
            ->willReturn('Field is required if');


        $handler = new ValidatorHandler($mockRule, $mockMessages);
        $handler->setDelegatedValidator($mockDelegated);
        $handler->sometimes($attribute, $rule);

        $data = $handler->validationData();
        $expected = [
            'rules' => [
                'field' => [
                    'laravelValidationRemote' => [
                        [
                            'RequiredIf',
                            ['field2', 'value2'],
                            'Field is required if',
                            false,
                            'field',
                        ]
                    ]
                ]
            ],
            'messages' => [],
        ];

        $this->assertEquals($expected, $data);
    }

    public function testDisableRemote()
    {
        $attribute = 'field';
        $rule = 'active_url';

        $mockDelegated = Mockery::mock(DelegatedValidator::class)->makePartial();
        $mockDelegated->shouldReceive('getRules')->andReturn([$attribute=>[$rule]]);
        $mockDelegated->shouldReceive('hasRule')->with($attribute, ValidatorHandler::JSVALIDATION_DISABLE)->andReturn(false);
        $mockDelegated->shouldReceive('parseRule')->with($rule)->andReturn(['ActiveUrl',['token',false,false]]);

        $mockRule = $this->getMockBuilder(RuleParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $mockRule->expects($this->once())
            ->method('getRule')
            ->with($attribute, 'ActiveUrl', ['token',false,false])
            ->willReturn([$attribute, RuleParser::REMOTE_RULE, ['token',false,false]]);

        $mockMessages = $this->getMockBuilder(MessageParser::class)
            ->setConstructorArgs([$mockDelegated] )
            ->getMock();

        $handler = new ValidatorHandler($mockRule, $mockMessages);
        $handler->setDelegatedValidator($mockDelegated);
        $handler->setRemote(false);

        $data = $handler->validationData();
        $expected = [
            'rules' => [],
            'messages' => [],
        ];

        $this->assertEquals($expected, $data);
    }
}
