<?php

namespace Proengsoft\JsValidation;

use Closure;
use Illuminate\Contracts\Container\Container;
use Illuminate\Session\Store;
use Illuminate\Validation\Factory as BaseFactory;
use Illuminate\Validation\PresenceVerifierInterface;
use Illuminate\Validation\Validator as BaseValidator;

class Factory
{
    /**
     * Enables or disable JsValidation Remote validations.
     *
     * @var
     */
    protected $jsRemoteEnabled;

    /**
     * Session Store used to secure Ajax validations.
     *
     * @var Store
     */
    protected $sessionStore;

    /**
     * Laravel Factory.
     *
     * @var \Illuminate\Validation\Factory
     */
    protected $factory;

    /**
     * Laravel Application Container.
     * @var Container
     */
    protected $container;

    /**
     * Create a new Validator factory instance.
     *
     * @param BaseFactory $factory
     */
    public function __construct(BaseFactory $factory, Container $container)
    {
        $this->factory = $factory;
        $this->container = $container;
    }

    /**
     * Create a new Validator instance.
     *
     * @param  array  $data
     * @param  array  $rules
     * @param  array  $messages
     * @param  array  $customAttributes
     * @return \Proengsoft\JsValidation\Validator
     */
    public function make(array $data, array $rules, array $messages = [], array $customAttributes = [])
    {
        $validator = $this->factory->make($data, $rules, $messages, $customAttributes);

        $jsValidator = $this->makeJsValidator($validator);
        $this->configureJsRemote($jsValidator);

        return $jsValidator;
    }

    /**
     * Creates new instance of Validator.
     *
     * @param BaseValidator $validator
     * @return Validator
     */
    protected function makeJsValidator(BaseValidator $validator)
    {
        $delegated = new DelegatedValidator($validator);

        return new Validator($delegated);
    }

    /**
     * Sets the session manager used to secure Ajax validations.
     *
     * @param \Illuminate\Session\Store $store
     */
    public function setSessionStore(Store $store)
    {
        $this->sessionStore = $store;
    }

    /**
     * Sets the session manager used to secure Ajax validations.
     *
     * @return \Illuminate\Session\Store
     */
    public function getSessionStore()
    {
        return $this->sessionStore;
    }

    /**
     * Enables or disable JsValidation Remote validations.
     *
     * @param bool $enabled
     */
    public function setJsRemoteEnabled($enabled)
    {
        $this->jsRemoteEnabled = (bool) $enabled;
    }

    /**
     * Check if JsValidation Remote validations are enabled.
     *
     * @return bool
     */
    public function isJsRemoteEnabled()
    {
        return $this->jsRemoteEnabled === true;
    }

    /**
     * Configure Javascript remote validations.
     *
     * @param Validator $validator
     */
    protected function configureJsRemote(Validator $validator)
    {
        if (is_null($this->sessionStore)) {
            return;
        }

        $token = $this->sessionStore->token();
        if (! is_null($this->container['encrypter'])) {
            $token = $this->container['encrypter']->encrypt($token);
        }

        $validator->setRemoteToken($token);
        $validator->enableRemote($this->jsRemoteEnabled);
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
        $this->factory->extend($rule, $extension, $message);
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
        $this->factory->extendImplicit($rule, $extension, $message);
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
        $this->factory->replacer($rule, $replacer);
    }

    /**
     * Set the Validator instance resolver.
     *
     * @param  \Closure $resolver
     * @return void
     */
    public function resolver(Closure $resolver)
    {
        $this->factory->resolver($resolver);
    }

    /**
     * Get the Translator implementation.
     *
     * @return \Symfony\Component\Translation\TranslatorInterface
     */
    public function getTranslator()
    {
        return $this->factory->getTranslator();
    }

    /**
     * Get the Presence Verifier implementation.
     *
     * @return \Illuminate\Validation\PresenceVerifierInterface
     */
    public function getPresenceVerifier()
    {
        return $this->factory->getPresenceVerifier();
    }

    /**
     * Set the Presence Verifier implementation.
     *
     * @param  \Illuminate\Validation\PresenceVerifierInterface $presenceVerifier
     * @return void
     */
    public function setPresenceVerifier(PresenceVerifierInterface $presenceVerifier)
    {
        $this->factory->setPresenceVerifier($presenceVerifier);
    }
}
