<?php

namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Container\Container;
use Illuminate\Contracts\Translation\Translator;
use Illuminate\Contracts\Validation\Factory as ValidationFactoryContract;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Redirector;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Validation\Factory as ValidationFactory;
use Illuminate\Validation\ValidationException;
use Mockery as m;
use Proengsoft\JsValidation\Remote\FormRequest;
use Proengsoft\JsValidation\Tests\TestCase;

class FormRequestTest extends TestCase
{
    protected $mocks = [];

    /**
     * Clean up the testing environment before the next test.
     *
     * @return void
     */
    protected function tearDown(): void
    {
        m::close();

        $this->mocks = [];
    }

    /**
     * Test passedValidation response.
     *
     * @return void
     */
    public function testPasses(): void
    {
        $request = $this->createRequest(['name' => 'specified']);

        try {
            $request->validateResolved();
        } catch (HttpResponseException $e) {
            $this->assertInstanceOf(JsonResponse::class, $e->getResponse());
            $this->assertSame('true', $e->getResponse()->getContent());
            $this->assertSame(200, $e->getResponse()->getStatusCode());

            return;
        }

        $this->fail('Expected exception was not thrown.');
    }

    /**
     * Test failedValidation response.
     *
     * @return void
     */
    public function testFailure()
    {
        $request = $this->createRequest(['no' => 'name']);

        try {
            $request->validateResolved();
        } catch (ValidationException $e) {
            $this->assertInstanceOf(JsonResponse::class, $e->getResponse());
            $this->assertSame('{"name":["error"]}', $e->getResponse()->getContent());
            $this->assertSame(200, $e->getResponse()->getStatusCode());

            return;
        }

        $this->fail('Expected exception was not thrown.');
    }

    /**
     * Create a new request of the given type.
     *
     * @param  array  $payload
     * @param  string  $class
     * @return \Illuminate\Foundation\Http\FormRequest
     */
    protected function createRequest($payload = [], $class = FoundationTestFormRequestStub::class)
    {
        $container = tap(new Container, function ($container) {
            $container->instance(
                ValidationFactoryContract::class,
                $this->createValidationFactory($container)
            );
        });

        $payload = array_merge([FormRequest::JS_VALIDATION_FIELD => 1], $payload);
        $request = $class::create('/', 'GET', $payload);

        return $request->setRedirector($this->createMockRedirector($request))
            ->setContainer($container);
    }

    /**
     * Create a new validation factory.
     *
     * @param  \Illuminate\Container\Container  $container
     * @return \Illuminate\Validation\Factory
     */
    protected function createValidationFactory($container)
    {
        $translator = m::mock(Translator::class);
        $translator->shouldReceive('get')->zeroOrMoreTimes()->andReturn('error');
        $translator->shouldReceive('trans')->zeroOrMoreTimes()->andReturn('error');

        return new ValidationFactory($translator, $container);
    }

    /**
     * Create a mock redirector.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Routing\Redirector
     */
    protected function createMockRedirector($request)
    {
        $redirector = $this->mocks['redirector'] = m::mock(Redirector::class);

        $redirector->shouldReceive('getUrlGenerator')->zeroOrMoreTimes()
            ->andReturn($generator = $this->createMockUrlGenerator());

        $redirector->shouldReceive('to')->zeroOrMoreTimes()
            ->andReturn($this->createMockRedirectResponse());

        $generator->shouldReceive('previous')->zeroOrMoreTimes()
            ->andReturn('previous');

        return $redirector;
    }

    /**
     * Create a mock URL generator.
     *
     * @return \Illuminate\Routing\UrlGenerator
     */
    protected function createMockUrlGenerator()
    {
        return $this->mocks['generator'] = m::mock(UrlGenerator::class);
    }

    /**
     * Create a mock redirect response.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function createMockRedirectResponse()
    {
        return $this->mocks['redirect'] = m::mock(RedirectResponse::class);
    }
}

class FoundationTestFormRequestStub extends FormRequest
{
    public function rules()
    {
        return ['name' => 'required'];
    }

    public function authorize()
    {
        return true;
    }
}
