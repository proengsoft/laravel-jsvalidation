<?php

namespace Proengsoft\JsValidation\Tests\Remote;

class CustomValidatorStubTest implements \Illuminate\Contracts\Validation\Factory
{
    protected $resolver;

    public function __construct($translator)
    {
        $this->resolver = function() use ($translator) {
            $m=\Mockery::mock('Illuminate\Validation\Validator[sometimes,getRules]',[$translator,[],[]])
                ->shouldAllowMockingMethod('sometimes');
            $m->shouldReceive('sometimes')
                ->once();
            $m->shouldReceive('getRules')
                ->andReturn(['field'=>['required']]);
            return $m;
        };
    }

    /**
     * Create a new Validator instance.
     *
     * @param  array $data
     * @param  array $rules
     * @param  array $messages
     * @param  array $customAttributes
     * @return \Illuminate\Contracts\Validation\Validator
     */
    public function make(array $data, array $rules, array $messages = [], array $customAttributes = [])
    {
        // TODO: Implement make() method.
    }

    /**
     * Register a custom validator extension.
     *
     * @param  string $rule
     * @param  \Closure|string $extension
     * @param  string $message
     * @return void
     */
    public function extend($rule, $extension, $message = null)
    {
        // TODO: Implement extend() method.
    }

    /**
     * Register a custom implicit validator extension.
     *
     * @param  string $rule
     * @param  \Closure|string $extension
     * @param  string $message
     * @return void
     */
    public function extendImplicit($rule, $extension, $message = null)
    {
        // TODO: Implement extendImplicit() method.
    }

    /**
     * Register a custom implicit validator message replacer.
     *
     * @param  string $rule
     * @param  \Closure|string $replacer
     * @return void
     */
    public function replacer($rule, $replacer)
    {
        // TODO: Implement replacer() method.
    }
}
