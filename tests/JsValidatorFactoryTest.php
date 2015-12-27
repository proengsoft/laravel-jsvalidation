<?php

namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Validation\Factory as ValidationFactory;
class JsValidatorFactoryTest extends \PHPUnit_Framework_TestCase
{

    public function testMake() {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $mockFactory = $this->getMock(
            'Illuminate\Contracts\Validation\Factory',
            ['make','extend','extendImplicit','replacer'], [], '', false
        );

        $mockValidator = $this->getMock(
            '\Illuminate\Validation\Validator',['addCustomAttributes'],
            [], '', false
        );
        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);

        $mockFactory->expects($this->once())
            ->method('make')
            ->with([], $rules, $messages, $customAttributes)
            ->willReturn($mockValidator);

        $app = $this->getMock('\Illuminate\Contracts\Container\Container');
        $app->expects($this->once())
            ->method('make')
            ->with(ValidationFactory::class)
            ->willReturn($mockFactory);

        $app->expects($this->once())
            ->method('__get')
            ->with('session')
            ->willReturn(null);


        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $factory = new JsValidatorFactory($app, $options);

        $factory->make($rules, $messages, $customAttributes, $selector);

    }

}
