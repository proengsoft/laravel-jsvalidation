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
        $delegated = $this->resolve($data, $rules, $messages, $customAttributes);
        $validator = $delegated->getValidator();

        if (! is_null($this->verifier)) {
            $validator->setPresenceVerifier($this->verifier);
        }

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
     * @return \Illuminate\Session\Store
     */
    public function getSessionStore()
    {
        return $this->sessionStore;
    }

    /**
     * Enables or disable JsValidation Remote validations
     *
     * @param boolean $enabled
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
