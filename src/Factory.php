<?php

namespace Proengsoft\JsValidation;

use Illuminate\Session\Store;
use Illuminate\Validation\Factory as BaseFactory;


class Factory extends BaseFactory
{
    /**
     * Enables or disable JsValidation Remote validations
     *
     * @var
     */
    protected $jsRemoteEnabled;

    /**
     * Session Store used to secure Ajax validations
     *
     * @var Store
     */
    protected $sessionStore;

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
        // The presence verifier is responsible for checking the unique and exists data
        // for the validator. It is behind an interface so that multiple versions of
        // it may be written besides database. We'll inject it into the validator.
        $delegated = $this->resolve($data, $rules, $messages, $customAttributes);
        $validator = $delegated->getValidator();

        if (! is_null($this->verifier)) {
            $validator->setPresenceVerifier($this->verifier);
        }

        // Next we'll set the IoC container instance of the validator, which is used to
        // resolve out class based validator extensions. If it is not set then these
        // types of extensions will not be possible on these validation instances.
        if (! is_null($this->container)) {
            $validator->setContainer($this->container);
        }

        $this->addExtensions($validator);

        $jsValidator = new Validator($delegated);
        $this->configureJsRemote($jsValidator);

        return $jsValidator;
    }

    /**
     * Resolve a new Validator instance.
     *
     * @param  array  $data
     * @param  array  $rules
     * @param  array  $messages
     * @param  array  $customAttributes
     * @return \Proengsoft\JsValidation\DelegatedValidator
     */
    protected function resolve(array $data, array $rules, array $messages, array $customAttributes)
    {
        $resolved = parent::resolve($data, $rules, $messages, $customAttributes);
        return new DelegatedValidator($resolved);
    }

    /**
     * Sets the session manager used to secure Ajax validations
     *
     * @param \Illuminate\Session\Store $store
     */
    public function setSessionStore(Store $store)
    {
        $this->sessionStore = $store;
    }

    /**
     * Sets the session manager used to secure Ajax validations
     *
     * @return \Illuminate\Session\SessionManager
     */
    public function getSessionStore()
    {
        return $this->sessionStore;
    }

    /**
     * Enables or disable JsValidation Remote validations
     *
     * @param $enabled
     */
    public function setJsRemoteEnabled($enabled)
    {
        $this->jsRemoteEnabled = (bool)$enabled;
    }

    /**
     * Enables or disable JsValidation Remote validations
     *
     * @return bool
     */
    public function getJsRemoteEnabled()
    {
        return $this->jsRemoteEnabled === true;
    }

    protected function configureJsRemote(Validator $validator) {
        if ( is_null($this->sessionStore)) return;

        $token = $this->sessionStore->token();
        if (! is_null($this->container['encrypter'])) {
            $token = $this->container['encrypter']->encrypt($token);
        }

        $validator->setRemoteToken($token);
        $validator->enableRemote($this->jsRemoteEnabled);
    }



}
