<?php

namespace Proengsoft\JsValidation;

use Closure;
use Illuminate\Http\Request;
use Proengsoft\JsValidation\Remote\Resolver;
use Proengsoft\JsValidation\Remote\ValidatorFallback;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;

/**
 * Class RemoteValidationMiddleware
 *
 * @deprecated 2.0 Required for Laravel <= 5.3 support
 * @see \Proengsoft\JsValidation\RemoteValidationMiddleware
 */
class RemoteValidationMiddlewareFallback
{
    /**
     * Validator factory instance to wrap.
     *
     * @var ValidationFactory
     */
    protected $factory;

    /**
     * Field used to detect Javascript validation.
     *
     * @var mixed
     */
    protected $field;

    /**
     * RemoteValidationMiddleware constructor.
     *
     * @param ValidationFactory $validator
     * @param Config            $config
     */
    public function __construct(ValidationFactory $validator, Config $config)
    {
        $this->factory = $validator;
        $this->field = $config->get('jsvalidation.remote_validation_field');
    }

    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param Closure                  $next
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->has($this->field)) {
            $this->wrapValidator();
        }

        return $next($request);
    }

    /**
     * Wraps Validaroe resolver with RemoteValidator resolver.
     */
    protected function wrapValidator()
    {
        $resolver = new Resolver($this->factory);
        $this->factory->resolver($resolver->resolver($this->field));
        $this->factory->extend(ValidatorFallback::EXTENSION_NAME, $resolver->validatorClosure());
    }
}
