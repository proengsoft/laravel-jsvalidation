<?php

namespace Proengsoft\JsValidation;

use Closure;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Contracts\Routing\Middleware;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;


class RemoteValidationMiddleware implements Middleware
{

    /**
     * Validator factory instance to wrap
     *
     * @var ValidationFactory
     */
    protected $factory;

    /**
     * Field used to detect Javascript validation
     *
     * @var mixed
     */
    protected $field;


    /**
     * RemoteValidationMiddleware constructor.
     *
     * @param ValidationFactory $validator
     * @param Config $config
     */
    public function __construct(ValidationFactory $validator, Config $config) {

        $this->factory = $validator;
        $this->field = $config->get('jsvalidation.remote_validation_field');

    }


    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->has($this->field)) {
            $this->wrapValidator();
        }

        return $next($request);
    }

    /**
     * Wraps Validaroe resolver with RemoteValidator resolver
     */
    protected function wrapValidator() {

        $validator = new RemoteValidator($this->factory);
        $this->factory->resolver($validator->resolver($this->field));
        $this->factory->extend(RemoteValidator::EXTENSION_NAME, $validator->validator());

    }



}