<?php

namespace Proengsoft\JsValidation;

use Closure;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
//use Illuminate\Validation\Factory as ValidationFactory;
use Illuminate\Contracts\Routing\Middleware;

class RemoteValidationMiddleware implements Middleware
{

    /**
     * @var ValidationFactory
     */
    protected $factory;

    protected $field;

    /**
     * @var Application
     */
    private $app;

    public function __construct(ValidationFactory $validator, Config $config) {

        $this->factory = $validator;
        $this->field = $config->get('jsvalidation.remote_validation_field');

    }


    public function handle($request, Closure $next)
    {
        if ($request->has($this->field)) {
            $this->wrapValidator();
        }

        return $next($request);
    }

    protected function wrapValidator() {

        $validator = new RemoteValidation($this->factory);
        $this->factory->resolver($validator->resolver($this->field));
        $this->factory->extend(RemoteValidation::EXTENSION_NAME, $validator->validator());

    }



}